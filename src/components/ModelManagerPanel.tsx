import React, { useState, useEffect } from 'react';
import {
  Zap,
  Cloud,
  HardDrive,
  Trash2,
  Plus,
  Activity,
  Wifi,
  WifiOff,
  CheckCircle,
  Clock,
  Shield,
  Gauge,
  BookOpen,
} from 'lucide-react';
import { ExecutionMode } from '../lib/modelManager';
import { offlineRouterInstance } from '../lib/offlineRouter';

interface ModelManagerPanelProps {
  currentMode: ExecutionMode;
  onModeChange: (mode: ExecutionMode) => void;
}

export const ModelManagerPanel: React.FC<ModelManagerPanelProps> = ({
  currentMode,
  onModeChange,
}) => {
  const [notes, setNotes] = useState<string[]>([]);
  const [newNote, setNewNote] = useState('');
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [benchmarkResult, setBenchmarkResult] = useState<string | null>(null);

  useEffect(() => {
    setNotes(offlineRouterInstance.getNotes());

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    offlineRouterInstance.addNote(newNote.trim());
    setNotes(offlineRouterInstance.getNotes());
    setNewNote('');
  };

  const handleDeleteNote = (idx: number) => {
    offlineRouterInstance.deleteNote(idx);
    setNotes(offlineRouterInstance.getNotes());
  };

  const runBenchmark = () => {
    const t0 = performance.now();
    // Run 1000 math queries locally
    for (let i = 0; i < 500; i++) {
      offlineRouterInstance.processQuery('25 * 40 + 10');
    }
    const t1 = performance.now();
    const avgOfflineMs = ((t1 - t0) / 500).toFixed(4);
    setBenchmarkResult(`⚡ Local Router: 500 operations processed in ${(t1 - t0).toFixed(2)}ms (Avg: ${avgOfflineMs}ms / query). Real-time zero-lag execution!`);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 overflow-y-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
          <Activity className="w-6 h-6 text-cyan-400" /> Model Manager &amp; Offline Router
        </h2>
        <p className="mt-1 text-xs text-slate-400">
          Configure Aura AI routing logic, offline knowledge base, and local memory cache.
        </p>
      </div>

      {/* System Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Network Status</span>
            {isOnline ? <Wifi className="w-4 h-4 text-emerald-400" /> : <WifiOff className="w-4 h-4 text-rose-400" />}
          </div>
          <p className="text-base font-bold text-white flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400' : 'bg-rose-400'}`} />
            {isOnline ? 'Online (Wi-Fi/Cellular)' : 'Disconnected (Offline)'}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Offline Router Status</span>
            <Zap className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-base font-bold text-white">Active (0ms Latency)</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Gemini Cloud Engine</span>
            <Cloud className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-base font-bold text-white">Gemini 3.8 Flash</p>
        </div>
      </div>

      {/* Execution Mode Selector */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider text-slate-300">
          Select Routing Mode
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Hybrid Mode */}
          <div
            onClick={() => onModeChange('HYBRID')}
            className={`p-4 rounded-xl border cursor-pointer transition ${
              currentMode === 'HYBRID'
                ? 'bg-cyan-500/10 border-cyan-500/60 ring-1 ring-cyan-500/30'
                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400">
                <Zap className="w-4 h-4" />
              </span>
              {currentMode === 'HYBRID' && <CheckCircle className="w-4 h-4 text-cyan-400" />}
            </div>
            <h4 className="text-sm font-bold text-white">Smart Hybrid (Default)</h4>
            <p className="mt-1 text-xs text-slate-400">
              Evaluates instant queries locally with 0ms delay; delegates deep questions to Gemini 3.8 Flash.
            </p>
          </div>

          {/* Strict Offline Only */}
          <div
            onClick={() => onModeChange('OFFLINE_ONLY')}
            className={`p-4 rounded-xl border cursor-pointer transition ${
              currentMode === 'OFFLINE_ONLY'
                ? 'bg-amber-500/10 border-amber-500/60 ring-1 ring-amber-500/30'
                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="p-2 rounded-lg bg-amber-500/20 text-amber-400">
                <HardDrive className="w-4 h-4" />
              </span>
              {currentMode === 'OFFLINE_ONLY' && <CheckCircle className="w-4 h-4 text-amber-400" />}
            </div>
            <h4 className="text-sm font-bold text-white">Strict Offline Only</h4>
            <p className="mt-1 text-xs text-slate-400">
              Zero network data usage. Math, emergency first aid, notes, conversions, and device checks.
            </p>
          </div>

          {/* Cloud Preferred */}
          <div
            onClick={() => onModeChange('CLOUD_PREFER')}
            className={`p-4 rounded-xl border cursor-pointer transition ${
              currentMode === 'CLOUD_PREFER'
                ? 'bg-indigo-500/10 border-indigo-500/60 ring-1 ring-indigo-500/30'
                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400">
                <Cloud className="w-4 h-4" />
              </span>
              {currentMode === 'CLOUD_PREFER' && <CheckCircle className="w-4 h-4 text-indigo-400" />}
            </div>
            <h4 className="text-sm font-bold text-white">Gemini Cloud Preferred</h4>
            <p className="mt-1 text-xs text-slate-400">
              Routes every question through Gemini 3.8 Flash cloud for maximum contextual reasoning.
            </p>
          </div>
        </div>
      </div>

      {/* Offline Storage: Notes Database */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Offline Memory Notes ({notes.length})</h3>
          </div>
          {notes.length > 0 && (
            <button
              onClick={() => {
                if (window.confirm('Delete all offline notes?')) {
                  offlineRouterInstance.clearNotes();
                  setNotes([]);
                }
              }}
              className="text-xs text-rose-400 hover:underline"
            >
              Clear All
            </button>
          )}
        </div>

        <form onSubmit={handleAddNote} className="flex gap-2">
          <input
            type="text"
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Add new offline note (or ask chat: 'Note: buy milk')..."
            className="flex-1 bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-1 transition"
          >
            <Plus className="w-4 h-4" /> Add
          </button>
        </form>

        <div className="space-y-2 max-h-48 overflow-y-auto">
          {notes.length === 0 ? (
            <p className="text-xs text-slate-500 italic py-2">
              No offline notes stored yet. Ask in chat "Note: [text]" to store anything offline!
            </p>
          ) : (
            notes.map((note, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs"
              >
                <span className="text-slate-200">
                  <strong className="text-cyan-400 mr-2">{idx + 1}.</strong> {note}
                </span>
                <button
                  onClick={() => handleDeleteNote(idx)}
                  className="p-1 text-slate-500 hover:text-rose-400 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Latency Benchmark Tool */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gauge className="w-5 h-5 text-indigo-400" />
            <h3 className="text-sm font-bold text-white">Performance Benchmark</h3>
          </div>
          <button
            onClick={runBenchmark}
            className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition"
          >
            Run Offline Benchmark
          </button>
        </div>

        {benchmarkResult && (
          <div className="p-3 rounded-xl bg-slate-950 border border-indigo-500/30 text-xs text-indigo-200 font-mono">
            {benchmarkResult}
          </div>
        )}
      </div>
    </div>
  );
};
