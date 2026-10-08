/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  MessageSquare,
  Smartphone,
  Cpu,
  Layers,
  Sparkles,
  Download,
  Info,
} from 'lucide-react';
import { AuraChatView } from './components/AuraChatView';
import { AndroidProjectHub } from './components/AndroidProjectHub';
import { ModelManagerPanel } from './components/ModelManagerPanel';
import { PWAInstallBanner } from './components/PWAInstallBanner';
import { OfflineIndicator } from './components/OfflineIndicator';
import { usePWAInstall } from './hooks/usePWAInstall';
import { ExecutionMode } from './lib/modelManager';

export default function App() {
  const [activeTab, setActiveTab] = useState<'chat' | 'hub' | 'models'>('chat');
  const [currentMode, setCurrentMode] = useState<ExecutionMode>('HYBRID');
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();

  const handleInstallClick = async () => {
    if (isInstallable) {
      await install();
    } else {
      alert(
        'To install Aura AI on your mobile device:\n1. Open browser menu (3 dots or share icon)\n2. Tap "Add to Home screen" or "Install App"'
      );
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 font-sans select-none">
      {/* Top PWA Install Banner */}
      <PWAInstallBanner />

      {/* Main App Navigation Bar */}
      <header className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shadow-md shadow-cyan-500/20">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
              Aura AI <span className="text-[10px] text-cyan-400 font-normal">Mobile Edition</span>
            </h1>
          </div>
        </div>

        {/* Center / Right Tab Switcher */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'chat'
                ? 'bg-slate-800 text-cyan-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Assistant</span>
          </button>

          <button
            onClick={() => setActiveTab('hub')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'hub'
                ? 'bg-slate-800 text-cyan-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>APK &amp; Source</span>
          </button>

          <button
            onClick={() => setActiveTab('models')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'models'
                ? 'bg-slate-800 text-cyan-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Router Engine</span>
          </button>
        </div>

        {/* Install Button Header */}
        {!isInstalled && (
          <button
            onClick={handleInstallClick}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 text-xs font-semibold transition active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Install on Phone</span>
          </button>
        )}
      </header>

      {/* Main View Area */}
      <main className="flex-1 overflow-hidden relative">
        {activeTab === 'chat' && (
          <AuraChatView
            currentMode={currentMode}
            onModeChange={setCurrentMode}
            onOpenApkHub={() => setActiveTab('hub')}
          />
        )}

        {activeTab === 'hub' && (
          <AndroidProjectHub
            onInstallPwa={handleInstallClick}
            isInstallable={isInstallable}
            isInstalled={isInstalled}
          />
        )}

        {activeTab === 'models' && (
          <ModelManagerPanel
            currentMode={currentMode}
            onModeChange={setCurrentMode}
          />
        )}
      </main>

      {/* Offline Toast Indicator */}
      <OfflineIndicator />
    </div>
  );
}
