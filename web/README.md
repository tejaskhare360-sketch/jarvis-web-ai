# J.A.R.V.I.S. // Stark Industries Holographic AI Web App

An ultra-futuristic, interactive web application bringing **Tony Stark's J.A.R.V.I.S.** (Just A Rather Very Intelligent System) to life. Powered by **Google Gemini AI**, the **Web Speech API**, and an interactive 60 FPS **Arc Reactor HUD Canvas**.

---

## 🌟 Key Features

### 1. ⚡ Interactive Arc Reactor HUD (HTML5 Canvas)
- **60 FPS Procedural Canvas Core**: Concentric rotating magnetic rings, palladium triangular core, 72-point compass ring, and copper flux coils.
- **Dynamic State Shifts**:
  - `IDLE`: Gentle cyan breathing pulse and slow majestic rotation.
  - `LISTENING`: Real-time audio waveform visualizer responding to your microphone.
  - `PROCESSING`: Rapid rotation with golden plasma sparks and energy flares.
  - `SPEAKING`: Rhythmic pulse expanding with J.A.R.V.I.S.'s speech cadence.
  - `ALERT`: Amber/Red warning oscillations.
- **Click to Speak**: Tap anywhere on the Arc Reactor to activate voice recognition.

### 2. 🎙️ Paul Bettany Voice & Speech Engine
- **Voice Recognition (STT)**: Hands-free vocal command recognition using `webkitSpeechRecognition` / `SpeechRecognition`.
- **British Butler TTS**: Text-to-Speech tuned for Paul Bettany's iconic cadence (prioritizes British English male voices: `Daniel`, `Oliver`, `Google UK English Male`).
- **Markdown & Code Sanitization**: Filters out raw code brackets before reading aloud so J.A.R.V.I.S. announces code naturally.
- **Vocal Modulation**: Pitch and speech rate sliders with instant test preview in the Settings modal.

### 3. 🔊 Pure Procedural Web Audio SFX
- **Zero External Audio Files**: 100% synthesized in the browser via the Web Audio API.
- Iconic Stark startup chime, repulsor blast discharge sound, high-tech interface beeps, and tactical alert tones.
- Full volume and mute controls stored in local browser memory.

### 4. 🧠 J.A.R.V.I.S. Brain (Google Gemini AI)
- **Stark Persona**: Impeccably polite, addresses you as "Sir", dry British wit, master of physics, engineering, and tactical strategy.
- **Real-Time Token Streaming**: Watch responses stream character-by-character with a glowing holographic typewriter cursor.
- **Multi-Turn Context**: Remembers previous turns throughout your conversation.
- **Markdown & Syntax Highlighting**: Clean dark code boxes with single-click "COPY CODE" buttons.
- **Zero-Config Offline Mode**: Even without an API key, J.A.R.V.I.S. can run full telemetry diagnostics, display armor dossiers, and test voice interactions.

### 5. 🛡️ Built-in Stark Protocols
- `[ 🛡️ Run Diagnostics ]`: Reads live browser specs (RAM, CPU cores, battery level, network latency) and generates a Mark LXXXV tactical status report.
- `[ ⚡ House Party Protocol ]`: Displays the Iron Man armor catalog (Mark I to Mark LXXXV).
- `[ 🛰️ Satellite Scan ]`: Orbital reconnaissance, local time, and planetary sensors.
- `[ 💻 Code Synthesis ]`: Modular engineering script generation.
- `[ 🎯 Tactical Analysis ]`: Threat assessment and defense recommendations.
- `[ 🧹 Clean Slate (Clear) ]`: Wipes conversation buffer and resets HUD telemetry.

---

## 🚀 Quick Start (Zero Dependencies)

### Option A — Run with Node.js
```bash
cd web
node server.js
```
Open **`http://localhost:3000`** in your browser.

### Option B — Run with Python 3
```bash
cd web
python3 server.py 3000
```
Open **`http://localhost:3000`** in your browser.

### Option C — Direct File Access or Any Static Server
Simply open `web/index.html` directly in Google Chrome, Microsoft Edge, Brave, or Safari!

---

## 🔑 Adding Your Google Gemini API Key

1. Get a free API key at [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Tap the **🔑 SETTINGS** button in the top HUD telemetry bar.
3. Paste your key and click **"SAVE PROTOCOLS"**.
4. *(Optional Server Method)*: Create a `.env` file in the `web/` directory with:
   ```env
   GEMINI_API_KEY=AIzaSy...
   ```
   The local server (`server.js` or `server.py`) will automatically load it.

---

## ⚡ Deploying to Vercel

The project is fully pre-configured for **Vercel** with automatic URL rewrites, static asset paths, and secure serverless API streaming functions.

### Deploy in 3 Steps:
1. Go to **[vercel.com/new](https://vercel.com/new)** and import your GitHub repository:
   ```
   https://github.com/tejaskhare360-sketch/jarvis-web-ai
   ```
2. **Root Directory**: Leave as `./` (or select `web`) — both configurations are pre-mapped!
3. **Environment Variables**: Add your API key:
   * **Name**: `GEMINI_API_KEY`
   * **Value**: Your Google Gemini API Key from Google AI Studio
4. Click **Deploy**.

### Vercel Path Architecture:
* `/` ➔ Maps directly to the holographic HUD (`web/index.html`)
* `/css/*` ➔ Static HUD stylesheet (`web/css/*`)
* `/js/*` ➔ Modular JavaScript engines (`web/js/*`)
* `/api/config` ➔ Vercel Serverless Function detecting your environment key
* `/api/chat` ➔ Vercel Serverless Function streaming Gemini AI tokens securely (no client-side API key exposure!)

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `Enter` | Transmit command to J.A.R.V.I.S. |
| `Shift + Enter` | Insert newline in input box |
| `Escape` | Silence active vocal synthesis / close modal |
| `Click Reactor` | Toggle speech recognition (microphone) |

---

*Property of Stark Industries. Mark LXXXV Architecture.*
