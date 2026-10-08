export interface OfflineRouteResult {
  isHandled: boolean;
  response: string;
  confidence: number;
  intent: string;
  executionTimeMs: number;
}

const STORAGE_KEY_NOTES = 'aura_offline_notes';

export class OfflineRouter {
  private notes: string[] = [];

  constructor() {
    this.loadNotes();
  }

  private loadNotes() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_NOTES);
      if (saved) {
        this.notes = JSON.parse(saved);
      }
    } catch {
      this.notes = [];
    }
  }

  private saveNotes() {
    try {
      localStorage.setItem(STORAGE_KEY_NOTES, JSON.stringify(this.notes));
    } catch (e) {
      console.warn('Could not save notes:', e);
    }
  }

  public getNotes(): string[] {
    return [...this.notes];
  }

  public addNote(content: string): number {
    this.notes.push(content);
    this.saveNotes();
    return this.notes.length;
  }

  public deleteNote(index: number): boolean {
    if (index >= 0 && index < this.notes.length) {
      this.notes.splice(index, 1);
      this.saveNotes();
      return true;
    }
    return false;
  }

  public clearNotes() {
    this.notes = [];
    this.saveNotes();
  }

  public processQuery(query: string): OfflineRouteResult {
    const startTime = performance.now();
    const normalized = query.trim().toLowerCase();

    // 1. Math calculation
    const mathResult = this.evaluateMath(normalized);
    if (mathResult !== null) {
      const elapsed = Math.round(performance.now() - startTime);
      return {
        isHandled: true,
        response: `🧮 Math Result: ${mathResult}`,
        confidence: 1.0,
        intent: 'MATH_CALCULATION',
        executionTimeMs: elapsed,
      };
    }

    // 2. Date and Time
    if (
      normalized.includes('time') ||
      normalized.includes('waqt') ||
      normalized.includes('date') ||
      normalized.includes('tareekh') ||
      normalized.includes('aaj kya din') ||
      normalized.includes('today')
    ) {
      const now = new Date();
      const formatted = now.toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      const elapsed = Math.round(performance.now() - startTime);
      return {
        isHandled: true,
        response: `🕒 Current Date & Time: ${formatted}`,
        confidence: 0.95,
        intent: 'DATETIME_CHECK',
        executionTimeMs: elapsed,
      };
    }

    // 3. Multilingual Greetings (Urdu / English / Roman Urdu)
    if (this.matchesGreeting(normalized)) {
      const elapsed = Math.round(performance.now() - startTime);
      return {
        isHandled: true,
        response: this.getGreetingResponse(normalized),
        confidence: 0.95,
        intent: 'GREETING',
        executionTimeMs: elapsed,
      };
    }

    // 4. Offline Notes Management
    if (
      normalized.startsWith('note:') ||
      normalized.startsWith('save note') ||
      normalized.startsWith('yaad rakhna') ||
      normalized.startsWith('likh lo')
    ) {
      const content = query.includes(':') ? query.split(':')[1].trim() : query.replace(/^(save note|yaad rakhna|likh lo)/i, '').trim();
      if (content) {
        const count = this.addNote(content);
        const elapsed = Math.round(performance.now() - startTime);
        return {
          isHandled: true,
          response: `📝 Note saved in offline memory: "${content}" (Total notes: ${count})`,
          confidence: 0.99,
          intent: 'OFFLINE_NOTE_SAVE',
          executionTimeMs: elapsed,
        };
      }
    }

    if (
      normalized === 'show notes' ||
      normalized === 'view notes' ||
      normalized === 'notes' ||
      normalized.includes('meray notes') ||
      normalized.includes('all notes')
    ) {
      const elapsed = Math.round(performance.now() - startTime);
      const resp =
        this.notes.length === 0
          ? '📝 No offline notes saved yet. Type "Note: [your message]" to save one.'
          : `📋 Saved Offline Notes:\n${this.notes.map((n, i) => `${i + 1}. ${n}`).join('\n')}`;
      return {
        isHandled: true,
        response: resp,
        confidence: 0.99,
        intent: 'OFFLINE_NOTES_VIEW',
        executionTimeMs: elapsed,
      };
    }

    // 5. Emergency First-Aid Guides
    const emergency = this.checkEmergencyGuide(normalized);
    if (emergency) {
      const elapsed = Math.round(performance.now() - startTime);
      return {
        isHandled: true,
        response: emergency,
        confidence: 0.98,
        intent: 'EMERGENCY_ASSIST',
        executionTimeMs: elapsed,
      };
    }

    // 6. Unit Conversion
    const conversion = this.checkUnitConversion(normalized);
    if (conversion) {
      const elapsed = Math.round(performance.now() - startTime);
      return {
        isHandled: true,
        response: conversion,
        confidence: 0.92,
        intent: 'UNIT_CONVERT',
        executionTimeMs: elapsed,
      };
    }

    // 7. Identity & Core Capability Info
    if (
      normalized.includes('who are you') ||
      normalized.includes('aap kon ho') ||
      normalized.includes('tum kon ho') ||
      normalized === 'aura' ||
      normalized.includes('what can you do') ||
      normalized.includes('kya kar sakte ho')
    ) {
      const elapsed = Math.round(performance.now() - startTime);
      return {
        isHandled: true,
        response:
          '✨ Aura AI: Main aapka smart mobile AI assistant hoon. Main offline router ke zariye instant answers provide karta hoon (Math, Notes, Time, Emergency Tips, Conversions), aur complex tasks ke liye Gemini 3.8 Flash Cloud Engine se connect hota hoon.',
        confidence: 0.95,
        intent: 'IDENTITY',
        executionTimeMs: elapsed,
      };
    }

    // Fallback: Not confident for local processing
    const elapsed = Math.round(performance.now() - startTime);
    return {
      isHandled: false,
      response: '',
      confidence: 0.2,
      intent: 'DELEGATE_TO_CLOUD',
      executionTimeMs: elapsed,
    };
  }

  private matchesGreeting(text: string): boolean {
    const keywords = [
      'salam',
      'assalam',
      'hello',
      'hi aura',
      'hey aura',
      'kya haal hai',
      'kaisay ho',
      'how are you',
      'adaab',
      'namaste',
      'kaise ho',
    ];
    return keywords.some((k) => text.includes(k));
  }

  private getGreetingResponse(text: string): string {
    if (text.includes('salam') || text.includes('assalam')) {
      return 'Walaikum Assalam! Main Aura AI hoon. Main aapki kya madad kar sakta hoon?';
    }
    if (text.includes('kya haal') || text.includes('kaisay ho') || text.includes('kaise ho') || text.includes('how are you')) {
      return 'Main theek hoon, shukriya! Aura AI offline router aur hybrid cloud engine ke sath tayar hai. Aap koi sawaal poochein ya calculation karein.';
    }
    return 'Hello! Aura AI is ready. You can ask questions, run offline math, or speak via microphone.';
  }

  private evaluateMath(text: string): string | null {
    // Check simple patterns like "24 * 35", "100 / 4", "50 + 25", "15% of 300"
    const percentMatch = text.match(/(\d+(\.\d+)?)\s*%\s*(?:of)?\s*(\d+(\.\d+)?)/i);
    if (percentMatch) {
      const pct = parseFloat(percentMatch[1]);
      const base = parseFloat(percentMatch[3]);
      const res = (pct / 100) * base;
      return `${pct}% of ${base} = ${res}`;
    }

    const simpleMatch = text.match(/(-?\d+(?:\.\d+)?)\s*([+\-*/^])\s*(-?\d+(?:\.\d+)?)/);
    if (simpleMatch) {
      const num1 = parseFloat(simpleMatch[1]);
      const op = simpleMatch[2];
      const num2 = parseFloat(simpleMatch[3]);

      let res: number | string = 0;
      switch (op) {
        case '+':
          res = num1 + num2;
          break;
        case '-':
          res = num1 - num2;
          break;
        case '*':
          res = num1 * num2;
          break;
        case '/':
          res = num2 !== 0 ? num1 / num2 : 'Cannot divide by zero';
          break;
        case '^':
          res = Math.pow(num1, num2);
          break;
        default:
          return null;
      }
      return `${num1} ${op} ${num2} = ${res}`;
    }

    return null;
  }

  private checkEmergencyGuide(text: string): string | null {
    if (text.includes('cpr')) {
      return '🚨 CPR Emergency Guide:\n1. Check responsiveness and call local emergency services immediately.\n2. Place hands in the center of the chest.\n3. Push hard and fast (100–120 compressions per minute).\n4. Allow chest to fully recoil between compressions.';
    }
    if (text.includes('burn') || text.includes('jal gaya')) {
      return '🚨 Burn First Aid:\n1. Cool the burn under gentle, cool running tap water for at least 10–20 minutes.\n2. Do NOT use ice, butter, or toothpaste.\n3. Remove constricting jewelry or clothing near the burn.\n4. Cover loosely with clean plastic wrap or sterile bandage.';
    }
    if (text.includes('bleeding') || text.includes('khoon')) {
      return '🚨 Bleeding First Aid:\n1. Apply continuous firm direct pressure with a clean cloth or gauze.\n2. Elevate the injured area above the heart if possible.\n3. Do not remove the cloth if it soaks through; add more layers on top.';
    }
    return null;
  }

  private checkUnitConversion(text: string): string | null {
    const kmMatch = text.match(/(\d+(?:\.\d+)?)\s*km\s*(?:to\s*miles)?/i);
    if (kmMatch) {
      const km = parseFloat(kmMatch[1]);
      const miles = (km * 0.621371).toFixed(2);
      return `📏 ${km} km ≈ ${miles} miles`;
    }

    const milesMatch = text.match(/(\d+(?:\.\d+)?)\s*miles\s*(?:to\s*km)?/i);
    if (milesMatch) {
      const miles = parseFloat(milesMatch[1]);
      const km = (miles * 1.60934).toFixed(2);
      return `📏 ${miles} miles ≈ ${km} km`;
    }

    const kgMatch = text.match(/(\d+(?:\.\d+)?)\s*kg\s*(?:to\s*lbs|pounds)?/i);
    if (kgMatch) {
      const kg = parseFloat(kgMatch[1]);
      const lbs = (kg * 2.20462).toFixed(2);
      return `⚖️ ${kg} kg ≈ ${lbs} lbs (pounds)`;
    }

    const cMatch = text.match(/(\d+(?:\.\d+)?)\s*c(?:elsius)?\s*to\s*f(?:ahrenheit)?/i);
    if (cMatch) {
      const c = parseFloat(cMatch[1]);
      const f = ((c * 9) / 5 + 32).toFixed(1);
      return `🌡️ ${c}°C = ${f}°F`;
    }

    return null;
  }
}

export const offlineRouterInstance = new OfflineRouter();
