/**
 * J.A.R.V.I.S. Main Application Controller
 * Wires the HUD interface, Arc Reactor canvas, Web Speech Engine,
 * procedural audio SFX, and Gemini AI streaming.
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize core subsystems
  const sfx = window.jarvisSFX;
  const arc = new ArcReactorHUD('arcReactorCanvas');
  window.arcReactor = arc;

  const gemini = new JarvisGeminiService();
  window.geminiService = gemini;

  // DOM Elements
  const messagesContainer = document.getElementById('messagesContainer');
  const chatInput = document.getElementById('chatInput');
  const sendBtn = document.getElementById('sendBtn');
  const micBtn = document.getElementById('micBtn');
  const speechPreview = document.getElementById('speechPreview');
  const settingsModal = document.getElementById('settingsModal');
  const settingsBtn = document.getElementById('settingsBtn');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const saveSettingsBtn = document.getElementById('saveSettingsBtn');
  const sfxToggleBtn = document.getElementById('sfxToggleBtn');
  const clearChatBtn = document.getElementById('clearChatBtn');
  
  // Settings Inputs
  const apiKeyInput = document.getElementById('apiKeyInput');
  const voiceSelect = document.getElementById('voiceSelect');
  const rateRange = document.getElementById('rateRange');
  const rateVal = document.getElementById('rateVal');
  const pitchRange = document.getElementById('pitchRange');
  const pitchVal = document.getElementById('pitchVal');
  const sfxVolumeRange = document.getElementById('sfxVolumeRange');
  const sfxVolumeVal = document.getElementById('sfxVolumeVal');
  const testVoiceBtn = document.getElementById('testVoiceBtn');

  // Telemetry Elements
  const telemetryClock = document.getElementById('telemetryClock');
  const batteryVal = document.getElementById('batteryVal');
  const tempVal = document.getElementById('tempVal');
  const latencyVal = document.getElementById('latencyVal');

  let isGenerating = false;

  // 2. Initialize Voice Engine
  const voice = new JarvisVoiceEngine({
    onSpeechStart: () => {
      micBtn.classList.add('recording');
      arc.setState('listening');
      speechPreview.classList.add('active');
      speechPreview.textContent = 'LISTENING FOR VOCAL COMMAND...';
    },
    onTranscript: (interim) => {
      speechPreview.textContent = `"${interim}"`;
      arc.setAudioLevel(0.65);
    },
    onFinalTranscript: (finalText) => {
      speechPreview.textContent = `Transcribed: "${finalText}"`;
      chatInput.value = finalText;
      setTimeout(() => {
        speechPreview.classList.remove('active');
        handleSendMessage();
      }, 400);
    },
    onSpeechEnd: () => {
      micBtn.classList.remove('recording');
      if (arc.state === 'listening') {
        arc.setState('idle');
      }
      setTimeout(() => {
        if (!voice.isListening) {
          speechPreview.classList.remove('active');
        }
      }, 1000);
    }
  });
  window.voiceEngine = voice;

  // 3. Telemetry Update Loop (Clock, Battery, Simulated Thermal Temp)
  function updateTelemetry() {
    const now = new Date();
    telemetryClock.textContent = now.toLocaleTimeString('en-US', { hour12: false });

    // Subtle thermal fluctuation (38.1 to 38.6 °C)
    const temp = (38.1 + Math.sin(now.getTime() / 4000) * 0.4).toFixed(1);
    if (tempVal) tempVal.textContent = `${temp} °C`;

    // Latency fluctuation (12 to 18 ms)
    const lat = Math.floor(14 + Math.sin(now.getTime() / 6000) * 3);
    if (latencyVal) latencyVal.textContent = `${lat} ms`;
  }
  setInterval(updateTelemetry, 1000);
  updateTelemetry();

  // Battery monitoring
  if (navigator.getBattery) {
    navigator.getBattery().then(b => {
      const updateBattery = () => {
        const lvl = Math.round(b.level * 100);
        batteryVal.textContent = `${lvl}%`;
      };
      updateBattery();
      b.addEventListener('levelchange', updateBattery);
    });
  }

  // 4. Populate Voices in Settings Modal
  function populateVoiceDropdown() {
    const voices = voice.getAvailableVoices();
    voiceSelect.innerHTML = '';
    
    voices.forEach(v => {
      const opt = document.createElement('option');
      opt.value = v.name;
      opt.textContent = `${v.name} (${v.lang})${v.lang.includes('GB') ? ' [RECOMMENDED]' : ''}`;
      if (voice.preferredVoice && v.name === voice.preferredVoice.name) {
        opt.selected = true;
      }
      voiceSelect.appendChild(opt);
    });
  }
  // Delayed call so voices finish loading in Chrome/Safari
  setTimeout(populateVoiceDropdown, 600);
  if (window.speechSynthesis) {
    window.speechSynthesis.onvoiceschanged = populateVoiceDropdown;
  }

  // 5. Sound Effects Button
  sfxToggleBtn.addEventListener('click', () => {
    const muted = sfx.toggleMute();
    sfxToggleBtn.classList.toggle('active', !muted);
    sfxToggleBtn.innerHTML = muted ? '🔇 <span>MUTED</span>' : '🔊 <span>AUDIO ON</span>';
    if (!muted) sfx.playBeep(1400, 0.05);
  });

  // 6. Settings Modal Handlers
  settingsBtn.addEventListener('click', () => {
    sfx.playBeep(1200, 0.04);
    apiKeyInput.value = gemini.getApiKey();
    rateRange.value = voice.speechRate;
    rateVal.textContent = `${voice.speechRate}x`;
    pitchRange.value = voice.speechPitch;
    pitchVal.textContent = `${voice.speechPitch}`;
    sfxVolumeRange.value = sfx.volume;
    sfxVolumeVal.textContent = `${Math.round(sfx.volume * 100)}%`;
    populateVoiceDropdown();
    settingsModal.classList.add('open');
  });

  closeModalBtn.addEventListener('click', () => {
    sfx.playBeep(800, 0.04);
    settingsModal.classList.remove('open');
  });

  settingsModal.addEventListener('click', (e) => {
    if (e.target === settingsModal) {
      settingsModal.classList.remove('open');
    }
  });

  rateRange.addEventListener('input', () => {
    rateVal.textContent = `${rateRange.value}x`;
  });

  pitchRange.addEventListener('input', () => {
    pitchVal.textContent = `${pitchRange.value}`;
  });

  sfxVolumeRange.addEventListener('input', () => {
    sfxVolumeVal.textContent = `${Math.round(sfxVolumeRange.value * 100)}%`;
  });

  testVoiceBtn.addEventListener('click', () => {
    voice.setVoice(voiceSelect.value);
    voice.setSpeechRate(parseFloat(rateRange.value));
    voice.setSpeechPitch(parseFloat(pitchRange.value));
    voice.speak("Vocal modulation test successful, Sir. How is my pitch?");
  });

  saveSettingsBtn.addEventListener('click', () => {
    gemini.setApiKey(apiKeyInput.value);
    if (voiceSelect.value) voice.setVoice(voiceSelect.value);
    voice.setSpeechRate(parseFloat(rateRange.value));
    voice.setSpeechPitch(parseFloat(pitchRange.value));
    sfx.setVolume(parseFloat(sfxVolumeRange.value));

    sfx.playSuccess();
    settingsModal.classList.remove('open');
  });

  // 7. Clear Conversation Buffer (Clean Slate Protocol)
  clearChatBtn.addEventListener('click', () => {
    sfx.playAlert();
    gemini.clearHistory();
    voice.stopSpeaking();
    messagesContainer.innerHTML = '';
    appendInitialGreeting();
  });

  // 8. Auto-expand textarea & Keydown Listener
  chatInput.addEventListener('input', () => {
    chatInput.style.height = 'auto';
    chatInput.style.height = `${Math.min(chatInput.scrollHeight, 120)}px`;
    sendBtn.disabled = !chatInput.value.trim() || isGenerating;
  });

  chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!sendBtn.disabled) {
        handleSendMessage();
      }
    }
  });

  // 9. Send Message Action
  sendBtn.addEventListener('click', handleSendMessage);
  micBtn.addEventListener('click', () => {
    voice.toggleListening();
  });

  // 10. Protocol Chips Click Delegation
  document.querySelectorAll('.protocol-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const command = chip.getAttribute('data-command');
      if (command) {
        chatInput.value = command;
        handleSendMessage();
      }
    });
  });

  // Welcome Screen Quick Cards Delegation
  document.addEventListener('click', (e) => {
    const welcomeCard = e.target.closest('.welcome-card');
    if (welcomeCard) {
      const prompt = welcomeCard.getAttribute('data-prompt');
      if (prompt) {
        chatInput.value = prompt;
        handleSendMessage();
      }
    }
  });

  // Global Keyboard Shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      voice.stopSpeaking();
      if (settingsModal.classList.contains('open')) {
        settingsModal.classList.remove('open');
      }
    }
  });

  // Canvas click toggles speech recognition
  document.getElementById('arcReactorCanvas').addEventListener('click', () => {
    sfx.playBeep(1400, 0.05);
    voice.toggleListening();
  });

  /* ========================================================================
     MESSAGE DISPATCHER & STREAMING HANDLER
     ======================================================================== */
  async function handleSendMessage() {
    const text = chatInput.value.trim();
    if (!text || isGenerating) return;

    isGenerating = true;
    sendBtn.disabled = true;
    chatInput.value = '';
    chatInput.style.height = 'auto';

    // Play repulsor blast sound
    sfx.playRepulsor();

    // 1. Append user message bubble
    appendMessage('user', text);

    // 2. Prepare J.A.R.V.I.S. bubble with blinking cursor
    const jarvisMsgEl = appendMessage('jarvis', '', true);
    const contentEl = jarvisMsgEl.querySelector('.msg-content');

    arc.setState('processing');

    // 3. Stream from Gemini / Protocols
    await gemini.streamChat(
      text,
      // On chunk
      (partialText) => {
        contentEl.innerHTML = JarvisGeminiService.renderMarkdown(partialText) + '<span class="streaming-cursor"></span>';
        scrollToBottom();
      },
      // On complete
      (fullText) => {
        contentEl.innerHTML = JarvisGeminiService.renderMarkdown(fullText);
        arc.setState('idle');
        isGenerating = false;
        sendBtn.disabled = false;
        scrollToBottom();

        // Speak response with British butler voice
        voice.speak(fullText);
      },
      // On error
      (errorHtml) => {
        contentEl.innerHTML = errorHtml;
        arc.setState('alert');
        sfx.playAlert();
        isGenerating = false;
        sendBtn.disabled = false;
        scrollToBottom();
      }
    );
  }

  function appendMessage(sender, content, isStreaming = false) {
    const bubble = document.createElement('div');
    bubble.className = `message-bubble ${sender}`;

    const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
    const headerTitle = sender === 'user' ? 'TONY STARK // COMMAND' : 'J.A.R.V.I.S. // PROTOCOL ACTIVE';

    const renderedHtml = sender === 'user' 
      ? `<p>${escapeHtml(content)}</p>` 
      : JarvisGeminiService.renderMarkdown(content);

    bubble.innerHTML = `
      <div class="msg-header">
        <span>${headerTitle}</span>
        <span>${timestamp}</span>
      </div>
      <div class="msg-content">${renderedHtml}${isStreaming ? '<span class="streaming-cursor"></span>' : ''}</div>
      ${sender === 'jarvis' && !isStreaming ? `
        <div class="msg-actions">
          <button class="msg-action-btn replay-btn" title="Replay Vocal Synthesis">🔊 Speak</button>
          <button class="msg-action-btn copy-btn" title="Copy response">📋 Copy</button>
        </div>
      ` : ''}
    `;

    // Replay button listener
    const replayBtn = bubble.querySelector('.replay-btn');
    if (replayBtn) {
      replayBtn.addEventListener('click', () => {
        voice.speak(content);
      });
    }

    // Copy button listener
    const copyBtn = bubble.querySelector('.copy-btn');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(content);
        copyBtn.textContent = '✓ Copied';
        setTimeout(() => copyBtn.textContent = '📋 Copy', 1500);
      });
    }

    messagesContainer.appendChild(bubble);
    scrollToBottom();
    return bubble;
  }

  function appendInitialGreeting() {
    const welcomeHtml = StarkProtocols.getOfflineWelcome();
    appendMessage('jarvis', welcomeHtml);
  }

  function scrollToBottom() {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  function escapeHtml(text) {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // 11. Initial Boot Sequence
  setTimeout(() => {
    sfx.playStartup();
    appendInitialGreeting();
  }, 400);
});
