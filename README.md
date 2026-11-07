# Stark AI Chatbot Suite — J.A.R.V.I.S. Web App & Android App

This repository houses two AI Chatbot experiences powered by **Google Gemini**:
1. 🌐 **[J.A.R.V.I.S. Holographic Web App (`web/`)](#-jarvis-holographic-web-app)**: Tony Stark's futuristic HUD AI assistant with an interactive 60 FPS Arc Reactor Canvas, Paul Bettany British TTS vocal synthesis, Web Speech API speech recognition, procedural Web Audio SFX, and Stark Protocols.
2. 📱 **[Android AI Chatbot (`app/`)](#-android-ai-chatbot)**: Native Android app built with Kotlin, Jetpack Compose, Material 3, and Coroutines.

---

## 🌐 J.A.R.V.I.S. Holographic Web App

An ultra-futuristic holographic HUD web application bringing Tony Stark's AI assistant to life in your browser.

### 🌟 Web App Highlights
- ⚡ **Interactive Arc Reactor (Canvas 60 FPS)**: Concentric rotating magnetic rings, palladium core, audio frequency waves, and state transformations (`IDLE`, `LISTENING`, `PROCESSING`, `SPEAKING`, `ALERT`). Tap the core to toggle speech recognition.
- 🎙️ **Paul Bettany British Voice & Speech-to-Text**: Built-in speech recognition (`webkitSpeechRecognition`) for hands-free voice commands, plus Text-to-Speech tuned for Paul Bettany's calm, witty British butler delivery.
- 🔊 **Procedural Web Audio SFX**: Repulsor blasts, Stark boot chimes, and tactical UI sounds synthesized with zero external audio assets.
- 🧠 **Google Gemini Cognitive Engine**: Real-time token streaming with typewriter cursor, multi-turn memory, and markdown/code syntax highlighting.
- 🛡️ **Stark Protocols**: Built-in commands for *Run Diagnostics*, *House Party Protocol* (Mark 1 to 85 armor archive), *Satellite Scan*, *Code Synthesis*, and *Clean Slate*.

### 🚀 How to Run the Web App

Inside your terminal:
```bash
cd web
node server.js
```
*Or using Python:*
```bash
cd web
python3 server.py 3000
```
Then navigate to **`http://localhost:3000`** in Google Chrome, Edge, Brave, or Safari!

---

## 📱 Android AI Chatbot

- ⚡ **Real-Time Token Streaming**: Watch responses stream into the chat dynamically chunk-by-chunk with a live blinking cursor.
- 🧠 **Multi-Turn Conversational Memory**: Preserves context from prior turns in the dialogue so Gemini remembers the conversation.
- 🎨 **Material 3 / Material You**: Beautiful UI with dark/light mode support, modern chat bubble design, and dynamic theming (Android 12+).
- 🔑 **In-App API Key Configuration**: Seamlessly enter, update, or obscure your Gemini API key in the app dialog without hardcoding secrets or re-building.
- 📋 **One-Tap Message Copying**: Easily copy AI responses to the clipboard.
- 🧹 **Conversation Reset**: Clear chat history at any time with one click.
- 💡 **Starter Suggestion Cards**: Interactive quick prompts on the welcome screen to get started immediately.

---

## 🏗️ Architecture & Tech Stack

- **UI Layer**: Jetpack Compose, Material 3, Edge-to-Edge (`enableEdgeToEdge`)
- **State & Architecture**: MVVM with `AndroidViewModel` and Kotlin `StateFlow`
- **Asynchronous Execution**: Kotlin Coroutines (`viewModelScope`) & Reactive `Flow`
- **AI SDK**: Google Generative AI Client SDK for Android (`com.google.ai.client.generativeai`)
- **Minimum SDK**: Android 8.0 (API 26) — compatible with >95% of active devices
- **Target SDK**: Android 15 (API 35)

---

## 🚀 How to Run in Android Studio

Since Android Studio is installed on your Mac at `/Applications/Android Studio.app`:

1. **Launch Android Studio**.
2. Select **Open** (or **File > Open...**).
3. Navigate to and select this project directory:
   ```
   /Users/tejassinghkhare/Downloads/Chatbot
   ```
4. Wait a few moments for Gradle to automatically sync dependencies.
5. Select an **Android Virtual Device (Emulator)** or connect a physical Android device via USB.
6. Click the green **Run (▶)** button or press `Control + R`.

---

## 🔑 Getting Your Gemini API Key

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Sign in with your Google Account and click **"Create API Key"**.
3. Copy the generated key.
4. Open the app on your device or emulator and paste the key when prompted (or tap the 🔑 **Key** icon in the top app bar).

---

## 📂 Project Structure

```
Chatbot/
├── gradle/
│   ├── libs.versions.toml             # Version catalog (AGP, Kotlin, Compose, SDKs)
│   └── wrapper/
│       └── gradle-wrapper.properties   # Gradle 8.10.2 distribution
├── app/
│   ├── build.gradle.kts                # App-level build configuration & dependencies
│   └── src/main/
│       ├── AndroidManifest.xml         # Internet permissions & launcher activity
│       ├── res/                        # Vector icons, colors, themes, strings
│       └── java/com/example/geminichat/
│           ├── MainActivity.kt         # Edge-to-edge entry point
│           ├── model/
│           │   └── ChatMessage.kt      # Data models & participant roles
│           ├── data/
│           │   └── GeminiService.kt    # GenerativeModel & streaming Flow wrapper
│           ├── viewmodel/
│           │   └── ChatViewModel.kt    # StateFlow & coroutine streaming manager
│           └── ui/
│               ├── ChatScreen.kt       # Scaffold, message list, app bar
│               ├── components/
│               │   ├── ChatBubble.kt   # Animated streaming message bubble
│               │   ├── ChatInputBar.kt # Auto-resizing input & send button
│               │   ├── ApiKeyDialog.kt # In-app API key settings dialog
│               │   └── EmptyChatPlaceholder.kt # Welcome greeting & starter chips
│               └── theme/              # Material 3 colors, typography, theme
├── build.gradle.kts                    # Root build script
├── settings.gradle.kts                 # Repositories & module inclusions
└── README.md                           # Documentation
```
