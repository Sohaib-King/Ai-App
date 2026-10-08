import { offlineRouterInstance, OfflineRouteResult } from './offlineRouter';

export type ExecutionMode = 'HYBRID' | 'OFFLINE_ONLY' | 'CLOUD_PREFER';

export interface ModelQueryResponse {
  text: string;
  source: string; // "⚡ Offline Engine" or "☁️ Gemini 3.8 Flash"
  latencyMs: number;
  confidence: number;
  error?: boolean;
}

export class ClientModelManager {
  private mode: ExecutionMode = 'HYBRID';

  public getMode(): ExecutionMode {
    return this.mode;
  }

  public setMode(newMode: ExecutionMode) {
    this.mode = newMode;
  }

  public async executeQuery(
    prompt: string,
    image?: { base64: string; mimeType: string }
  ): Promise<ModelQueryResponse> {
    const startTime = performance.now();
    const isOnline = navigator.onLine;

    // Strict Offline Mode
    if (this.mode === 'OFFLINE_ONLY') {
      if (image) {
        return {
          text: '⚠️ Image analysis requires Cloud Vision. Please switch to Hybrid or Gemini Cloud mode.',
          source: '⚡ Offline Engine',
          latencyMs: 1,
          confidence: 0.2,
          error: true,
        };
      }
      const offline = offlineRouterInstance.processQuery(prompt);
      const elapsed = Math.round(performance.now() - startTime);
      if (offline.isHandled) {
        return {
          text: offline.response,
          source: '⚡ Offline Engine',
          latencyMs: elapsed,
          confidence: offline.confidence,
        };
      } else {
        return {
          text: '⚠️ Offline Only mode is enabled. Aura AI local router handles Math, Unit Conversions, Notes, Emergency Tips, Time/Date, and Greetings. Switch to Hybrid or Cloud mode for general conversational AI.',
          source: '⚡ Offline Engine',
          latencyMs: elapsed,
          confidence: 0.3,
        };
      }
    }

    // Cloud Preferred Mode
    if (this.mode === 'CLOUD_PREFER') {
      if (isOnline) {
        try {
          const cloudResp = await this.callCloudApi(prompt, image);
          const elapsed = Math.round(performance.now() - startTime);
          return {
            text: cloudResp.reply,
            source: cloudResp.source || '☁️ Gemini 3.8 Flash',
            latencyMs: cloudResp.latencyMs || elapsed,
            confidence: 0.98,
          };
        } catch (err: any) {
          const offline = offlineRouterInstance.processQuery(prompt);
          const elapsed = Math.round(performance.now() - startTime);
          if (offline.isHandled) {
            return {
              text: `${offline.response}\n\n*(Notice: Cloud connection failed, responded via offline engine)*`,
              source: '⚡ Offline Engine (Network Fallback)',
              latencyMs: elapsed,
              confidence: offline.confidence,
            };
          }
          return {
            text: `Cloud AI error: ${err.message || 'Network error'}.`,
            source: '☁️ Cloud Error',
            latencyMs: elapsed,
            confidence: 0,
            error: true,
          };
        }
      } else {
        // Disconnected
        const offline = offlineRouterInstance.processQuery(prompt);
        const elapsed = Math.round(performance.now() - startTime);
        if (offline.isHandled) {
          return {
            text: offline.response,
            source: '⚡ Offline Engine (No Network)',
            latencyMs: elapsed,
            confidence: offline.confidence,
          };
        }
        return {
          text: 'Offline: No internet connection detected. Aura AI local engine could not resolve this complex query. Connect to Wi-Fi/Mobile Data for Gemini Cloud.',
          source: '⚡ Offline Engine',
          latencyMs: elapsed,
          confidence: 0.2,
          error: true,
        };
      }
    }

    // Hybrid Mode (Smart Routing)
    // 1. If not an image query, check fast offline pattern first
    if (!image) {
      const offline = offlineRouterInstance.processQuery(prompt);
      if (offline.isHandled && offline.confidence >= 0.85) {
        const elapsed = Math.round(performance.now() - startTime);
        return {
          text: offline.response,
          source: '⚡ Offline Engine',
          latencyMs: elapsed,
          confidence: offline.confidence,
        };
      }
    }

    // 2. Route to Cloud if connected
    if (isOnline) {
      try {
        const cloudResp = await this.callCloudApi(prompt, image);
        const elapsed = Math.round(performance.now() - startTime);
        return {
          text: cloudResp.reply,
          source: cloudResp.source || '☁️ Gemini 3.8 Flash',
          latencyMs: cloudResp.latencyMs || elapsed,
          confidence: 0.98,
        };
      } catch (err: any) {
        // If cloud fails, fallback to whatever offline router could muster
        const offline = offlineRouterInstance.processQuery(prompt);
        const elapsed = Math.round(performance.now() - startTime);
        if (offline.response) {
          return {
            text: offline.response,
            source: '⚡ Offline Engine (Fallback)',
            latencyMs: elapsed,
            confidence: offline.confidence,
          };
        }
        return {
          text: `⚠️ Cloud request failed (${err.message || 'Unknown'}). Please check your connection.`,
          source: '☁️ Cloud Error',
          latencyMs: elapsed,
          confidence: 0,
          error: true,
        };
      }
    } else {
      // Offline fallback
      const offline = offlineRouterInstance.processQuery(prompt);
      const elapsed = Math.round(performance.now() - startTime);
      if (offline.isHandled) {
        return {
          text: offline.response,
          source: '⚡ Offline Engine',
          latencyMs: elapsed,
          confidence: offline.confidence,
        };
      }
      return {
        text: 'Device is offline. Aura AI local engine is active for math, emergency guides, notes, time, and unit conversions. Connect to network for Gemini AI reasoning.',
        source: '⚡ Offline Engine',
        latencyMs: elapsed,
        confidence: 0.3,
      };
    }
  }

  private async callCloudApi(
    prompt: string,
    image?: { base64: string; mimeType: string }
  ): Promise<{ reply: string; source: string; latencyMs: number }> {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt,
        imageBase64: image?.base64,
        imageMimeType: image?.mimeType,
      }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `Server responded with ${res.status}`);
    }

    return await res.json();
  }
}

export const clientModelManager = new ClientModelManager();
