import React, { useState } from 'react';
import {
  Download,
  Smartphone,
  GitBranch,
  Terminal,
  FileCode,
  Check,
  Copy,
  ExternalLink,
  Cpu,
  Layers,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  FolderArchive,
  QrCode,
} from 'lucide-react';

interface AndroidProjectHubProps {
  onInstallPwa: () => void;
  isInstallable: boolean;
  isInstalled: boolean;
}

export const AndroidProjectHub: React.FC<AndroidProjectHubProps> = ({
  onInstallPwa,
  isInstallable,
  isInstalled,
}) => {
  const [selectedFile, setSelectedFile] = useState<string>('MainActivity.kt');
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [activeTab, setActiveTab] = useState<'options' | 'files'>('options');

  const filesMap: Record<string, { path: string; lang: string; content: string }> = {
    'MainActivity.kt': {
      path: 'app/src/main/java/com/aura/ai/MainActivity.kt',
      lang: 'kotlin',
      content: `package com.aura.ai

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Bundle
import android.speech.RecognitionListener
import android.speech.RecognizerIntent
import android.speech.SpeechRecognizer
import android.speech.tts.TextToSpeech
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import com.aura.ai.databinding.ActivityMainBinding
import com.google.android.material.chip.Chip
import com.google.android.material.dialog.MaterialAlertDialogBuilder
import kotlinx.coroutines.launch
import java.util.Locale

class MainActivity : AppCompatActivity(), TextToSpeech.OnInitListener {
    // Enhanced with Voice STT, TTS Speech playback,
    // Offline / Hybrid mode switcher, Quick Prompt chips, and Camera Vision!
    private lateinit var binding: ActivityMainBinding
    private lateinit var modelManager: ModelManager
    private var textToSpeech: TextToSpeech? = null
    private var speechRecognizer: SpeechRecognizer? = null
    ...
}`,
    },
    'OfflineRouter.kt': {
      path: 'app/src/main/java/com/aura/ai/OfflineRouter.kt',
      lang: 'kotlin',
      content: `package com.aura.ai

/**
 * OfflineRouter: High-efficiency local routing engine for Aura AI.
 * Handles instant local queries with zero network latency:
 * - Math computations (24 * 35 + 160, percentages, powers)
 * - Date & Time checks
 * - Multilingual Greetings (Urdu, Roman Urdu, English)
 * - Offline Notes Manager (Note: ..., show notes)
 * - Emergency First-Aid Guides (CPR, Burns, Bleeding)
 * - Unit Conversions (km/miles, kg/lbs, Celsius/Fahrenheit)
 */
class OfflineRouter {
    ...
}`,
    },
    'ModelManager.kt': {
      path: 'app/src/main/java/com/aura/ai/ModelManager.kt',
      lang: 'kotlin',
      content: `package com.aura.ai

/**
 * ModelManager: Orchestrates offline vs online execution for Aura AI.
 * Modes:
 * - HYBRID: Smart auto-router (instant offline, cloud fallback)
 * - OFFLINE_ONLY: 0 data usage, maximum battery life
 * - CLOUD_PREFER: Full Gemini 3.8 Flash Cloud intelligence
 */
class ModelManager(private val context: Context) {
    ...
}`,
    },
    'build-apk.yml': {
      path: '.github/workflows/build-apk.yml',
      lang: 'yaml',
      content: `name: Build Aura AI APK
on:
  push:
    branches: [ "main", "master" ]
  workflow_dispatch:

jobs:
  build:
    name: Build Android APK
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with:
          java-version: '17'
          distribution: 'temurin'
      - name: Build Debug APK
        run: ./gradlew assembleDebug
      - name: Upload APK
        uses: actions/upload-artifact@v4
        with:
          name: aura-ai-apk
          path: app/build/outputs/apk/debug/app-debug.apk`,
    },
    'AndroidManifest.xml': {
      path: 'app/src/main/AndroidManifest.xml',
      lang: 'xml',
      content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.RECORD_AUDIO" />
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.VIBRATE" />
    ...
</manifest>`,
    },
    'build.gradle.kts': {
      path: 'app/build.gradle.kts',
      lang: 'kotlin',
      content: `plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}
android {
    namespace = "com.aura.ai"
    compileSdk = 34
    defaultConfig {
        applicationId = "com.aura.ai"
        minSdk = 24
        targetSdk = 34
        versionCode = 2
        versionName = "2.0.0"
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
}`,
    },
  };

  const handleDownloadZip = async () => {
    try {
      setIsDownloading(true);
      const res = await fetch('/api/project/zip');
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'AuraAI-Android-Project.zip';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      alert('Could not download zip: ' + e);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 overflow-y-auto p-4 sm:p-6 space-y-6">
      {/* Hero Header */}
      <div className="rounded-2xl p-6 bg-gradient-to-br from-indigo-950/80 via-slate-900 to-slate-950 border border-indigo-500/30 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-semibold mb-3 border border-cyan-500/20">
              <Sparkles className="w-3.5 h-3.5" /> Aura AI • Mobile APK & Source Hub
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Android APK & Mobile Deployment
            </h1>
            <p className="mt-2 text-sm text-slate-300 max-w-xl leading-relaxed">
              Updated Android Kotlin project package with <strong>Offline Router</strong>,{' '}
              <strong>Voice Speech</strong>, <strong>Camera Vision</strong>, and{' '}
              <strong>Automated Cloud APK Build Workflow</strong>.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={handleDownloadZip}
              disabled={isDownloading}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-cyan-500/20 active:scale-95 transition disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              {isDownloading ? 'Packaging ZIP...' : 'Download Updated Project (.ZIP)'}
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('options')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
            activeTab === 'options'
              ? 'bg-slate-800 text-cyan-400 border border-slate-700'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          📱 How to Use On Your Mobile Phone
        </button>
        <button
          onClick={() => setActiveTab('files')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
            activeTab === 'files'
              ? 'bg-slate-800 text-cyan-400 border border-slate-700'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          📂 Project Files Explorer
        </button>
      </div>

      {/* TAB 1: HOW TO USE ON MOBILE */}
      {activeTab === 'options' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Method 1: Instant Mobile PWA Installation */}
          <div className="rounded-2xl p-5 bg-slate-900/90 border border-slate-800 hover:border-cyan-500/40 transition flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                  <Smartphone className="w-5 h-5" />
                </span>
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Recommended • Instant
                </span>
              </div>
              <h3 className="text-base font-bold text-white">1. Direct Mobile App Install (WebAPK)</h3>
              <p className="mt-1 text-xs text-slate-300 leading-relaxed">
                You can install Aura AI onto your Android phone right now without needing a PC or Android SDK!
                It installs directly to your home screen with a native app icon, offline cache, full-screen UI, and microphone support.
              </p>

              <div className="mt-4 p-3 bg-slate-950 rounded-xl border border-slate-800/80 text-xs text-slate-300 space-y-1">
                <p><strong>On Android (Chrome / Edge / Samsung Internet):</strong></p>
                <p>1. Tap the <strong>Install Aura AI</strong> button below.</p>
                <p>2. Or tap the 3 dots (⋮) menu in Chrome and select <strong>"Add to Home screen" / "Install app"</strong>.</p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
              {isInstalled ? (
                <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                  <Check className="w-4 h-4" /> Installed on Device
                </div>
              ) : (
                <button
                  onClick={onInstallPwa}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-semibold text-xs hover:bg-cyan-400 active:scale-95 transition"
                >
                  <Smartphone className="w-4 h-4" /> Install Aura AI on Mobile
                </button>
              )}
            </div>
          </div>

          {/* Method 2: GitHub Actions Automated Cloud APK Build */}
          <div className="rounded-2xl p-5 bg-slate-900/90 border border-slate-800 hover:border-indigo-500/40 transition flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                  <GitBranch className="w-5 h-5" />
                </span>
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                  Pre-configured CI/CD
                </span>
              </div>
              <h3 className="text-base font-bold text-white">2. Free Cloud APK Build (GitHub Actions)</h3>
              <p className="mt-1 text-xs text-slate-300 leading-relaxed">
                The downloaded project includes <code className="text-cyan-300">.github/workflows/build-apk.yml</code>.
                GitHub will compile the APK in the cloud for free in under 2 minutes:
              </p>

              <div className="mt-4 p-3 bg-slate-950 rounded-xl border border-slate-800/80 text-xs text-slate-300 space-y-1 font-mono">
                <p>1. Download & push project to a GitHub repo.</p>
                <p>2. Open GitHub &gt; <strong>Actions</strong> tab.</p>
                <p>3. Click <strong>"Build Aura AI APK"</strong> &gt; <strong>Run workflow</strong>.</p>
                <p>4. Download <strong>app-debug.apk</strong> from Artifacts!</p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800">
              <span className="text-xs text-indigo-400 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Workflow file included in ZIP
              </span>
            </div>
          </div>

          {/* Method 3: Mobile Termux Build */}
          <div className="rounded-2xl p-5 bg-slate-900/90 border border-slate-800 hover:border-purple-500/40 transition flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                  <Terminal className="w-5 h-5" />
                </span>
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
                  Direct on Phone
                </span>
              </div>
              <h3 className="text-base font-bold text-white">3. Build APK on Android Phone with Termux</h3>
              <p className="mt-1 text-xs text-slate-300 leading-relaxed">
                If you have Termux installed on your Android phone, you can compile the APK directly on the device:
              </p>

              <div className="mt-4 p-3 bg-slate-950 rounded-xl border border-slate-800/80 font-mono text-xs text-slate-300 space-y-1 overflow-x-auto">
                <p className="text-purple-400"># Run in Termux app:</p>
                <p>pkg update && pkg install openjdk-17 gradle</p>
                <p>cd AuraAI-Android-Project</p>
                <p>gradle assembleDebug</p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>Produces <code className="text-slate-200">app-debug.apk</code></span>
            </div>
          </div>

          {/* Method 4: Android Studio */}
          <div className="rounded-2xl p-5 bg-slate-900/90 border border-slate-800 hover:border-cyan-500/40 transition flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                  <Cpu className="w-5 h-5" />
                </span>
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  Standard Developer Flow
                </span>
              </div>
              <h3 className="text-base font-bold text-white">4. Android Studio (1-Click Build)</h3>
              <p className="mt-1 text-xs text-slate-300 leading-relaxed">
                Unzip the project on your computer, open in Android Studio, and click <strong>Build &gt; Build APK(s)</strong>.
              </p>

              <div className="mt-4 p-3 bg-slate-950 rounded-xl border border-slate-800/80 text-xs text-slate-300 space-y-1">
                <p>• Compatible with Android Studio Hedgehog, Iguana & Jellyfish.</p>
                <p>• Pre-configured with Kotlin 1.9.22, Gradle 8.3, and Target SDK 34.</p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs text-cyan-400 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Ready for one-click import
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PROJECT FILES EXPLORER */}
      {activeTab === 'files' && (
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 overflow-hidden flex flex-col">
          <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between overflow-x-auto gap-2">
            <div className="flex items-center gap-1">
              {Object.keys(filesMap).map((fileName) => (
                <button
                  key={fileName}
                  onClick={() => setSelectedFile(fileName)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono transition ${
                    selectedFile === fileName
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                      : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                  }`}
                >
                  {fileName}
                </button>
              ))}
            </div>

            <button
              onClick={() => handleCopyCode(filesMap[selectedFile].content)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>

          <div className="px-4 py-2 bg-slate-900 border-b border-slate-800/60 text-[11px] font-mono text-slate-400">
            Path: <span className="text-cyan-400">{filesMap[selectedFile].path}</span>
          </div>

          <div className="p-4 bg-slate-950/80 font-mono text-xs overflow-x-auto max-h-96">
            <pre className="text-slate-300 whitespace-pre-wrap">{filesMap[selectedFile].content}</pre>
          </div>
        </div>
      )}
    </div>
  );
};
