import express, { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import fs from 'fs';
import JSZip from 'jszip';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '25mb' }));

// Shared server-side Gemini client with telemetry header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Chat API endpoint (called only from client, never exposes API key)
app.post('/api/chat', async (req: Request, res: Response) => {
  const startTime = Date.now();
  try {
    const { prompt, imageBase64, imageMimeType, history } = req.body;

    if (!prompt && !imageBase64) {
      return res.status(400).json({ error: 'Prompt or image is required' });
    }

    const contents: any[] = [];

    // System context to ensure Aura AI persona and multilingual support (Urdu & English)
    const systemPrompt = `You are Aura AI, an intelligent mobile AI assistant created for fast, polite, helpful responses in both English and Urdu/Roman Urdu. Be concise, friendly, and structured.`;

    if (imageBase64 && imageMimeType) {
      contents.push({
        parts: [
          {
            inlineData: {
              mimeType: imageMimeType,
              data: imageBase64.replace(/^data:[^;]+;base64,/, ''),
            },
          },
          {
            text: `${systemPrompt}\n\nUser Question: ${prompt || 'Analyze this image and describe what you see.'}`,
          },
        ],
      });
    } else {
      contents.push({
        parts: [
          {
            text: `${systemPrompt}\n\nUser Query: ${prompt}`,
          },
        ],
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: contents.length === 1 ? contents[0] : contents,
    });

    const reply = response.text || 'Aura AI did not generate a response.';
    const latencyMs = Date.now() - startTime;

    return res.json({
      reply,
      model: 'gemini-3.8-flash',
      latencyMs,
      source: '☁️ Gemini 3.8 Flash',
    });
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    const latencyMs = Date.now() - startTime;
    return res.status(500).json({
      error: error.message || 'Failed to process AI query',
      latencyMs,
    });
  }
});

// Download full updated Android Studio project as a ZIP
app.get('/api/project/zip', async (_req: Request, res: Response) => {
  try {
    const zip = new JSZip();
    const androidDir = path.resolve(process.cwd(), 'android_project');

    function addDirectoryToZip(currentDir: string, zipFolder: JSZip) {
      const items = fs.readdirSync(currentDir);
      for (const item of items) {
        const fullPath = path.join(currentDir, item);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          const subFolder = zipFolder.folder(item);
          if (subFolder) {
            addDirectoryToZip(fullPath, subFolder);
          }
        } else {
          const content = fs.readFileSync(fullPath);
          zipFolder.file(item, content);
        }
      }
    }

    if (fs.existsSync(androidDir)) {
      addDirectoryToZip(androidDir, zip);
    } else {
      return res.status(404).send('Android project folder not found');
    }

    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="AuraAI-Android-Project.zip"');
    res.setHeader('Content-Length', zipBuffer.length.toString());
    return res.send(zipBuffer);
  } catch (err: any) {
    console.error('Zip generation error:', err);
    return res.status(500).send('Error generating project ZIP');
  }
});

// Start server with Vite middleware in dev or static in prod
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

startServer();
