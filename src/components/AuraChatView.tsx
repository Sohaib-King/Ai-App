import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Camera,
  Image as ImageIcon,
  X,
  Sparkles,
  Zap,
  Cloud,
  CheckCheck,
  RotateCcw,
  Clock,
  HelpCircle,
  Calculator,
  ShieldAlert,
} from 'lucide-react';
import { clientModelManager, ExecutionMode } from '../lib/modelManager';
import { useSpeech } from '../hooks/useSpeech';

export interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: number;
  source?: string;
  latencyMs?: number;
  imagePreview?: string;
}

interface AuraChatViewProps {
  currentMode: ExecutionMode;
  onModeChange: (mode: ExecutionMode) => void;
  onOpenApkHub: () => void;
}

export const AuraChatView: React.FC<AuraChatViewProps> = ({
  currentMode,
  onModeChange,
  onOpenApkHub,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('aura_chat_history');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return [
      {
        id: 'init-1',
        text: 'Salam! Main Aura AI hoon. Main instant offline router aur Gemini 3.8 Flash Cloud ke zariye aapki madad ke liye tayar hoon.\n\nAap text type kar sakte hain, mic se bol sakte hain, ya photo upload kar ke sawal pooch sakte hain.',
        isUser: false,
        timestamp: Date.now(),
        source: '⚡ Offline Engine',
        latencyMs: 0,
      },
    ];
  });

  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [autoTts, setAutoTts] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{
    base64: string;
    mimeType: string;
    preview: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    speak,
    stopSpeaking,
    isSpeaking,
    startListening,
    stopListening,
    isListening,
    recognitionSupported,
  } = useSpeech();

  useEffect(() => {
    try {
      localStorage.setItem('aura_chat_history', JSON.stringify(messages.slice(-30)));
    } catch (e) {
      console.warn('Could not save chat history:', e);
    }
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (queryText?: string) => {
    const textToSend = (queryText || inputQuery).trim();
    if (!textToSend && !selectedImage) return;

    const userMessage: ChatMessage = {
      id: `usr-${Date.now()}`,
      text: textToSend,
      isUser: true,
      timestamp: Date.now(),
      imagePreview: selectedImage?.preview,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputQuery('');
    const imagePayload = selectedImage
      ? { base64: selectedImage.base64, mimeType: selectedImage.mimeType }
      : undefined;
    setSelectedImage(null);
    setIsLoading(true);

    try {
      clientModelManager.setMode(currentMode);
      const res = await clientModelManager.executeQuery(textToSend, imagePayload);

      const botMessage: ChatMessage = {
        id: `bot-${Date.now()}`,
        text: res.text,
        isUser: false,
        timestamp: Date.now(),
        source: res.source,
        latencyMs: res.latencyMs,
      };

      setMessages((prev) => [...prev, botMessage]);

      if (autoTts) {
        speak(res.text);
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-err-${Date.now()}`,
          text: `⚠️ Error: ${err.message || 'Something went wrong.'}`,
          isUser: false,
          timestamp: Date.now(),
          source: 'Error Handler',
          latencyMs: 0,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening((transcript) => {
        setInputQuery(transcript);
        handleSend(transcript);
      });
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setSelectedImage({
        base64: result,
        mimeType: file.type,
        preview: result,
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const clearChat = () => {
    if (window.confirm('Clear conversation history?')) {
      setMessages([]);
      localStorage.removeItem('aura_chat_history');
    }
  };

  const quickPrompts = [
    { label: '🧮 24 * 35 + 160', query: '24 * 35 + 160' },
    { label: '🕒 Date & Time', query: 'What is current date and time?' },
    { label: '🚨 CPR Steps', query: 'How to perform CPR emergency steps' },
    { label: '📏 25 km to miles', query: '25 km to miles' },
    { label: '📝 Note: Important task', query: 'Note: Finish Aura AI project build' },
    { label: '📋 View Notes', query: 'show notes' },
    { label: '✨ Explain Quantum Computing', query: 'Explain Quantum Computing simply in Roman Urdu' },
  ];

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100">
      {/* Top Mobile Bar */}
      <div className="px-4 py-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between backdrop-blur sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-500 via-indigo-600 to-purple-500 flex items-center justify-center shadow-lg shadow-cyan-500/20 ring-2 ring-cyan-400/30">
              <Sparkles className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-900" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-white text-base leading-tight">Aura AI</h2>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-medium">
                v2.0 Hybrid
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1">
              {currentMode === 'HYBRID' && (
                <>
                  <Zap className="w-3 h-3 text-cyan-400 inline" /> Smart Router (0ms Offline + Cloud)
                </>
              )}
              {currentMode === 'OFFLINE_ONLY' && (
                <>
                  <Zap className="w-3 h-3 text-amber-400 inline" /> Strict Offline Engine (0 Data)
                </>
              )}
              {currentMode === 'CLOUD_PREFER' && (
                <>
                  <Cloud className="w-3 h-3 text-indigo-400 inline" /> Gemini 3.8 Flash Cloud
                </>
              )}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* TTS Speaker Toggle */}
          <button
            onClick={() => {
              if (isSpeaking) stopSpeaking();
              setAutoTts(!autoTts);
            }}
            title={autoTts ? 'Auto Speak is ON' : 'Auto Speak is OFF'}
            className={`p-2 rounded-xl transition ${
              autoTts
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {autoTts ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Mode Switcher Pill */}
          <select
            value={currentMode}
            onChange={(e) => onModeChange(e.target.value as ExecutionMode)}
            className="bg-slate-800 text-slate-200 text-xs px-2.5 py-1.5 rounded-xl border border-slate-700 focus:outline-none focus:ring-1 focus:ring-cyan-500 cursor-pointer"
          >
            <option value="HYBRID">⚡ Hybrid</option>
            <option value="OFFLINE_ONLY">📴 Offline Only</option>
            <option value="CLOUD_PREFER">☁️ Gemini Cloud</option>
          </select>

          {/* Clear Button */}
          <button
            onClick={clearChat}
            title="Clear Chat History"
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700 transition"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.isUser ? 'items-end' : 'items-start'} max-w-full`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-md transition-all ${
                msg.isUser
                  ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white rounded-br-xs'
                  : 'bg-slate-900 border border-slate-800 text-slate-100 rounded-bl-xs'
              }`}
            >
              {/* Optional Attached Image Preview */}
              {msg.imagePreview && (
                <div className="mb-2 rounded-lg overflow-hidden border border-white/20 max-w-xs">
                  <img src={msg.imagePreview} alt="User upload" className="max-h-48 w-full object-cover" />
                </div>
              )}

              {/* Message text with basic formatting */}
              <div className="whitespace-pre-wrap leading-relaxed select-text font-normal">
                {msg.text}
              </div>

              {/* Footer / Meta info */}
              <div
                className={`mt-2 flex items-center justify-between text-[11px] gap-2 pt-1 border-t ${
                  msg.isUser ? 'border-white/10 text-cyan-200' : 'border-slate-800 text-slate-400'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  {msg.source && (
                    <span className="font-medium flex items-center gap-1">
                      {msg.source}
                    </span>
                  )}
                  {msg.latencyMs !== undefined && (
                    <span className="text-[10px] opacity-80">
                      • {msg.latencyMs}ms
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  <span>
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  {!msg.isUser && (
                    <button
                      onClick={() => speak(msg.text)}
                      title="Read aloud"
                      className="p-1 hover:text-cyan-400 transition"
                    >
                      <Volume2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-900/60 w-fit px-3 py-2 rounded-2xl border border-slate-800">
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>Aura AI is calculating answer...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Action Chips Bar */}
      <div className="px-3 py-2 bg-slate-950/80 border-t border-slate-900 overflow-x-auto no-scrollbar flex items-center gap-2">
        <span className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold pl-1 whitespace-nowrap">
          Quick:
        </span>
        {quickPrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(p.query)}
            disabled={isLoading}
            className="text-xs px-2.5 py-1 rounded-full bg-slate-900 text-slate-300 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-800 transition whitespace-nowrap active:scale-95 disabled:opacity-50"
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Selected Image Thumbnail preview if any */}
      {selectedImage && (
        <div className="px-4 py-2 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src={selectedImage.preview}
              alt="attachment"
              className="w-12 h-12 object-cover rounded-lg border border-cyan-500/40"
            />
            <div className="text-xs text-slate-300">
              <p className="font-medium text-cyan-400">Image attached</p>
              <p className="text-[11px] text-slate-500">Will be analyzed with Gemini Vision</p>
            </div>
          </div>
          <button
            onClick={() => setSelectedImage(null)}
            className="p-1 text-slate-400 hover:text-rose-400"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Bottom Input Field Container */}
      <div className="p-3 bg-slate-900/90 border-t border-slate-800 backdrop-blur">
        <div className="flex items-center gap-2 bg-slate-950 rounded-2xl p-1.5 border border-slate-800 focus-within:border-cyan-500/60 focus-within:ring-1 focus-within:ring-cyan-500/20 transition">
          {/* Hidden File Input */}
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleImageSelect}
            className="hidden"
          />

          {/* Camera / Image Attachment Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title="Attach Image or Camera photo"
            className="p-2 text-slate-400 hover:text-cyan-400 rounded-xl hover:bg-slate-900 transition"
          >
            <Camera className="w-5 h-5" />
          </button>

          {/* Query Text Input */}
          <textarea
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={
              currentMode === 'OFFLINE_ONLY'
                ? 'Type offline question, math, or notes...'
                : 'Ask Aura anything, or speak with mic...'
            }
            rows={1}
            className="flex-1 bg-transparent text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none resize-none py-2 px-1 max-h-28"
          />

          {/* Voice Microphone Button */}
          {recognitionSupported && (
            <button
              type="button"
              onClick={handleVoiceToggle}
              title={isListening ? 'Stop listening' : 'Start voice recognition'}
              className={`p-2 rounded-xl transition ${
                isListening
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse'
                  : 'text-slate-400 hover:text-cyan-400 hover:bg-slate-900'
              }`}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
          )}

          {/* Send Button */}
          <button
            type="button"
            onClick={() => handleSend()}
            disabled={(!inputQuery.trim() && !selectedImage) || isLoading}
            className="p-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white disabled:opacity-30 disabled:pointer-events-none hover:shadow-lg hover:shadow-cyan-500/25 active:scale-95 transition"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

        {/* Listening indicator toast */}
        {isListening && (
          <div className="mt-2 text-center text-xs text-rose-400 flex items-center justify-center gap-1.5 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            Listening to your voice... Speak now!
          </div>
        )}
      </div>
    </div>
  );
};
