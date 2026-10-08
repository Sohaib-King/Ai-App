# 🌟 Aura AI — Hybrid Mobile Assistant (Kotlin + Gemini)

Aura AI is an intelligent mobile assistant featuring an **Offline-First Router** for lightning-fast 0ms local tasks and **Gemini Cloud AI** for deep reasoning, vision analysis, and complex queries.

## 🚀 Key Features Added
- **⚡ Instant Offline Router**:
  - Local math evaluator (`24 * 35 + 160`)
  - Date, time & device calendar
  - Offline personal notes manager (`Note: your text`, `show notes`)
  - Emergency First-Aid guides (CPR, Burns, Bleeding)
  - Unit conversions (km to miles, kg to lbs)
  - Urdu & English conversational understanding
- **☁️ Gemini 3.8 Flash Cloud Engine**:
  - Deep conversational intelligence & complex problem solving
  - Multi-turn context memory
  - Image vision analysis
- **🎙️ Voice Speech & Text-to-Speech**:
  - Real-time Android SpeechRecognizer
  - Instant voice playback via TextToSpeech (TTS)
- **⚙️ Dynamic Model Manager**:
  - Auto-Hybrid mode (offline first, cloud fallback)
  - Strict Offline mode (0 data usage)
  - Cloud-Preferred mode (maximum intelligence)

---

## 📦 How to Build the APK

### Method 1: Instant GitHub Actions (No Android SDK Needed!)
1. Upload this project folder to your GitHub repository.
2. Go to **Actions** tab.
3. Select **"Build Aura AI APK"** and click **Run workflow**.
4. When finished (approx 2 minutes), download `aura-ai-debug-apk` containing `app-debug.apk`.
5. Transfer and install on your Android phone!

### Method 2: Android Studio
1. Open this folder in **Android Studio Hedgehog / Iguana / Jellyfish**.
2. Let Gradle sync dependencies.
3. Click **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
4. Locate the generated file at `app/build/outputs/apk/debug/app-debug.apk`.

### Method 3: Mobile Termux (Build directly on your Android phone!)
```bash
pkg update && pkg install openjdk-17 gradle git
cd android_project
gradle assembleDebug
```
The APK will be ready at `app/build/outputs/apk/debug/app-debug.apk`.
