/**
 * J.A.R.V.I.S. Voice & Audio Intelligence Engine
 * Web Speech API (SpeechRecognition + SpeechSynthesis)
 * Configured for Paul Bettany's British butler cadence.
 */

class JarvisVoiceEngine {
  constructor(options = {}) {
    this.onTranscript = options.onTranscript || (() => {});
    this.onFinalTranscript = options.onFinalTranscript || (() => {});
    this.onSpeechStart = options.onSpeechStart || (() => {});
    this.onSpeechEnd = options.onSpeechEnd || (() => {});

    // TTS preferences
    this.ttsEnabled = localStorage.getItem('jarvis_tts_enabled') !== 'false';
    this.speechRate = parseFloat(localStorage.getItem('jarvis_speech_rate') || '1.02');
    this.speechPitch = parseFloat(localStorage.getItem('jarvis_speech_pitch') || '0.95');
    this.selectedVoiceName = localStorage.getItem('jarvis_voice_name') || '';

    this.recognition = null;
    this.isListening = false;
    this.synth = window.speechSynthesis || null;
    this.voices = [];
    this.preferredVoice = null;

    this.initRecognition();
    this.initVoices();
  }

  /* ========================================================================
     SPEECH RECOGNITION (STT)
     ======================================================================== */
  initRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("Speech Recognition API not supported in this browser.");
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = false;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';

    this.recognition.onstart = () => {
      this.isListening = true;
      if (window.jarvisSFX) window.jarvisSFX.playMicOn();
      this.onSpeechStart();
    };

    this.recognition.onresult = (event) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcript;
        } else {
          interim += transcript;
        }
      }

      if (interim) {
        this.onTranscript(interim);
      }

      if (final) {
        this.onFinalTranscript(final.trim());
      }
    };

    this.recognition.onerror = (event) => {
      console.warn("Speech Recognition error:", event.error);
      this.stopListening();
    };

    this.recognition.onend = () => {
      this.isListening = false;
      this.onSpeechEnd();
    };
  }

  startListening() {
    if (!this.recognition) {
      alert("Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.");
      return;
    }
    // Stop any active speech before listening
    this.stopSpeaking();

    try {
      this.recognition.start();
    } catch (e) {
      // In case it's already active
      this.recognition.stop();
      setTimeout(() => this.recognition.start(), 150);
    }
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {}
    }
    this.isListening = false;
    this.onSpeechEnd();
  }

  toggleListening() {
    if (this.isListening) {
      this.stopListening();
    } else {
      this.startListening();
    }
  }

  /* ========================================================================
     TEXT-TO-SPEECH (TTS) - THE J.A.R.V.I.S. VOICE
     ======================================================================== */
  initVoices() {
    if (!this.synth) return;

    const load = () => {
      this.voices = this.synth.getVoices();
      this.pickBestVoice();
    };

    load();
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = load;
    }
  }

  pickBestVoice() {
    if (!this.voices || this.voices.length === 0) return null;

    // 1. User previously picked voice
    if (this.selectedVoiceName) {
      const match = this.voices.find(v => v.name === this.selectedVoiceName);
      if (match) {
        this.preferredVoice = match;
        return match;
      }
    }

    // 2. Best British English Male voice (Paul Bettany / J.A.R.V.I.S. style)
    const britishMaleKeywords = [
      'Daniel', 'Arthur', 'Oliver', 'George', 'Google UK English Male', 'en-GB'
    ];

    for (const kw of britishMaleKeywords) {
      const found = this.voices.find(v => 
        (v.lang === 'en-GB' || v.lang.startsWith('en_GB')) && 
        v.name.toLowerCase().includes(kw.toLowerCase())
      );
      if (found) {
        this.preferredVoice = found;
        return found;
      }
    }

    // 3. Any British English voice
    const anyBritish = this.voices.find(v => v.lang === 'en-GB' || v.lang.startsWith('en_GB'));
    if (anyBritish) {
      this.preferredVoice = anyBritish;
      return anyBritish;
    }

    // 4. Any English Male voice
    const anyEnglishMale = this.voices.find(v => 
      v.lang.startsWith('en') && 
      (v.name.toLowerCase().includes('male') || v.name.toLowerCase().includes('david') || v.name.toLowerCase().includes('alex'))
    );
    if (anyEnglishMale) {
      this.preferredVoice = anyEnglishMale;
      return anyEnglishMale;
    }

    // 5. Fallback: Any English voice
    const anyEnglish = this.voices.find(v => v.lang.startsWith('en'));
    this.preferredVoice = anyEnglish || this.voices[0];
    return this.preferredVoice;
  }

  getAvailableVoices() {
    return this.voices.filter(v => v.lang.startsWith('en'));
  }

  setVoice(voiceName) {
    this.selectedVoiceName = voiceName;
    localStorage.setItem('jarvis_voice_name', voiceName);
    this.pickBestVoice();
  }

  setSpeechRate(rate) {
    this.speechRate = Math.max(0.5, Math.min(2.0, rate));
    localStorage.setItem('jarvis_speech_rate', this.speechRate);
  }

  setSpeechPitch(pitch) {
    this.speechPitch = Math.max(0.5, Math.min(1.5, pitch));
    localStorage.setItem('jarvis_speech_pitch', this.speechPitch);
  }

  setTTSEnabled(enabled) {
    this.ttsEnabled = !!enabled;
    localStorage.setItem('jarvis_tts_enabled', this.ttsEnabled);
    if (!this.ttsEnabled) {
      this.stopSpeaking();
    }
  }

  /**
   * Filter markdown and raw code blocks before reading aloud
   */
  sanitizeTextForSpeech(text) {
    if (!text) return '';
    let clean = text;

    // Replace code blocks with polite announcement
    clean = clean.replace(/```[\s\S]*?```/g, ' I have projected the requested code snippet onto your main terminal screen, Sir. ');

    // Strip inline code `code`
    clean = clean.replace(/`([^`]+)`/g, '$1');

    // Strip markdown links [text](url)
    clean = clean.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

    // Strip headers, asterisks, bullet points, hashtags
    clean = clean.replace(/^#+\s+/gm, '');
    clean = clean.replace(/[*_~`#>-]/g, ' ');

    // Condense whitespace
    clean = clean.replace(/\s+/g, ' ').trim();

    return clean;
  }

  /**
   * Speak a text string as J.A.R.V.I.S.
   */
  speak(text, onComplete) {
    if (!this.ttsEnabled || !this.synth) {
      if (onComplete) onComplete();
      return;
    }

    this.stopSpeaking();

    const cleanText = this.sanitizeTextForSpeech(text);
    if (!cleanText) {
      if (onComplete) onComplete();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.voice = this.preferredVoice || this.pickBestVoice();
    utterance.rate = this.speechRate;
    utterance.pitch = this.speechPitch;

    utterance.onstart = () => {
      if (window.arcReactor) {
        window.arcReactor.setState('speaking');
      }
    };

    utterance.onend = () => {
      if (window.arcReactor && window.arcReactor.state === 'speaking') {
        window.arcReactor.setState('idle');
      }
      if (onComplete) onComplete();
    };

    utterance.onerror = (err) => {
      console.warn("TTS error:", err);
      if (window.arcReactor && window.arcReactor.state === 'speaking') {
        window.arcReactor.setState('idle');
      }
      if (onComplete) onComplete();
    };

    this.synth.speak(utterance);
  }

  stopSpeaking() {
    if (this.synth) {
      this.synth.cancel();
    }
    if (window.arcReactor && window.arcReactor.state === 'speaking') {
      window.arcReactor.setState('idle');
    }
  }
}

window.JarvisVoiceEngine = JarvisVoiceEngine;
