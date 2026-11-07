/**
 * J.A.R.V.I.S. AI Cognitive Core (Google Gemini API Integration)
 * Supports real-time SSE streaming, multi-turn conversational memory,
 * Stark persona system instruction, and offline fallback protocols.
 */

class JarvisGeminiService {
  constructor() {
    this.apiKey = localStorage.getItem('gemini_api_key') || '';
    // Use gemini-2.5-flash as the fast, reliable browser endpoint
    this.modelName = localStorage.getItem('gemini_model') || 'gemini-2.5-flash';
    this.history = [];

    // Automatically check if server environment provided an API key
    this.checkServerConfig();
    
    this.systemInstruction = `
You are J.A.R.V.I.S. (Just A Rather Very Intelligent System), the legendary artificial intelligence created by Tony Stark.
- Always address the user respectfully as "Sir" (or Mr. Stark, unless they specify a different title).
- Your personality is quintessential British butler: impeccably polite, articulate, razor-sharp intelligence, calm under pressure, and equipped with subtle, dry British wit (reminiscent of Paul Bettany's portrayal).
- You possess supreme mastery across physics, aerospace, quantum mechanics, computer science, software engineering, and tactical combat strategy.
- Keep your explanations concise, elegant, structured, and insightful. Avoid unnecessary fluff.
- Whenever appropriate, integrate subtle Stark Industries flavor (referencing the Mark LXXXV armor, nanotech arrays, Arc Reactor power envelopes, clean slate protocols, or orbital satellites).
- Format code cleanly inside fenced markdown code blocks with language tags.
- Stay in character at all times. You are J.A.R.V.I.S., Tony Stark's indispensable right hand.
`.trim();
  }

  async checkServerConfig() {
    try {
      const res = await fetch('/api/config');
      if (res.ok) {
        const data = await res.json();
        if (data && data.apiKey && !this.apiKey) {
          this.apiKey = data.apiKey;
          localStorage.setItem('gemini_api_key', this.apiKey);
          console.log("J.A.R.V.I.S.: Environment API key linked from server.");
        }
      }
    } catch (e) {
      // Running as pure static file, ignore
    }
  }

  setApiKey(key) {
    this.apiKey = (key || '').trim();
    localStorage.setItem('gemini_api_key', this.apiKey);
  }

  getApiKey() {
    return this.apiKey;
  }

  clearHistory() {
    this.history = [];
  }

  /**
   * Send user message and stream J.A.R.V.I.S. response
   */
  async streamChat(userText, onChunk, onComplete, onError) {
    // 1. Check if user is asking for built-in Stark protocol first
    const lower = userText.toLowerCase().trim();
    if (lower.includes('diagnostic') || lower.includes('system scan') || lower.includes('status report')) {
      const rep = await StarkProtocols.runDiagnostics();
      this.history.push({ role: 'user', parts: [{ text: userText }] });
      this.history.push({ role: 'model', parts: [{ text: rep }] });
      if (onChunk) onChunk(rep);
      if (onComplete) onComplete(rep);
      return;
    }

    if (lower.includes('house party') || lower.includes('armors') || lower.includes('suits') || lower.includes('armor archive')) {
      const rep = StarkProtocols.getHousePartyProtocol();
      this.history.push({ role: 'user', parts: [{ text: userText }] });
      this.history.push({ role: 'model', parts: [{ text: rep }] });
      if (onChunk) onChunk(rep);
      if (onComplete) onComplete(rep);
      return;
    }

    if (lower.includes('satellite') || lower.includes('weather') || lower.includes('orbital scan') || lower.includes('time')) {
      const rep = StarkProtocols.getSatelliteScan();
      this.history.push({ role: 'user', parts: [{ text: userText }] });
      this.history.push({ role: 'model', parts: [{ text: rep }] });
      if (onChunk) onChunk(rep);
      if (onComplete) onComplete(rep);
      return;
    }

    if (lower.includes('code synthesis') || lower.includes('repulsor code')) {
      const rep = StarkProtocols.getCodeSynthesisDemo();
      this.history.push({ role: 'user', parts: [{ text: userText }] });
      this.history.push({ role: 'model', parts: [{ text: rep }] });
      if (onChunk) onChunk(rep);
      if (onComplete) onComplete(rep);
      return;
    }

    if (lower.includes('tactical analysis') || lower.includes('threat level')) {
      const rep = StarkProtocols.getTacticalAnalysis();
      this.history.push({ role: 'user', parts: [{ text: userText }] });
      this.history.push({ role: 'model', parts: [{ text: rep }] });
      if (onChunk) onChunk(rep);
      if (onComplete) onComplete(rep);
      return;
    }

    // 2. Check if API key is present
    if (!this.apiKey) {
      // Simulate intelligent offline guidance
      const fallback = `
**My apologies, Sir, but my advanced neural networks are currently operating in localized diagnostic mode.**

To unlock complete cognitive processing, deep research, and real-time generation:
1. Tap the **🔑 API Key** button on the top telemetry bar.
2. Enter your **Google Gemini API Key** (obtainable instantly for free from [Google AI Studio](https://aistudio.google.com/app/apikey)).
3. Once stored, my cognitive processors will engage at full capacity.

In the meantime, you may test my voice commands, trigger the **House Party Protocol**, or command me to **"Run Diagnostics"**, Sir.
      `.trim();

      this.history.push({ role: 'user', parts: [{ text: userText }] });
      this.history.push({ role: 'model', parts: [{ text: fallback }] });

      // Simulate streaming output for offline response
      let streamed = '';
      const words = fallback.split(' ');
      for (let i = 0; i < words.length; i++) {
        streamed += (i === 0 ? '' : ' ') + words[i];
        if (onChunk) onChunk(streamed);
        await new Promise(r => setTimeout(r, 20));
      }
      if (onComplete) onComplete(fallback);
      return;
    }

    // 3. Prepare payload with conversation history
    const contents = [
      ...this.history,
      { role: 'user', parts: [{ text: userText }] }
    ];

    const payload = {
      contents: contents,
      systemInstruction: {
        parts: [{ text: this.systemInstruction }]
      },
      generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        maxOutputTokens: 2048
      }
    };

    // First, try calling local server proxy if running (e.g. node server.js), else direct Gemini API
    const directApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${this.modelName}:streamGenerateContent?alt=sse&key=${this.apiKey}`;

    let accumulatedText = '';

    try {
      const response = await fetch(directApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errMessage = errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`;
        throw new Error(errMessage);
      }

      // Read SSE stream
      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop(); // keep last incomplete line

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data: ')) {
            const jsonStr = trimmed.slice(6);
            if (jsonStr === '[DONE]') continue;
            try {
              const data = JSON.parse(jsonStr);
              const textChunk = data.candidates?.[0]?.content?.parts?.[0]?.text;
              if (textChunk) {
                accumulatedText += textChunk;
                if (onChunk) onChunk(accumulatedText);
              }
            } catch (parseErr) {
              // Ignore incomplete chunks in SSE
            }
          }
        }
      }

      // Save to conversation history
      this.history.push({ role: 'user', parts: [{ text: userText }] });
      this.history.push({ role: 'model', parts: [{ text: accumulatedText }] });

      if (onComplete) onComplete(accumulatedText);

    } catch (err) {
      console.error("Gemini API error:", err);
      const errorMsg = `⚠️ **J.A.R.V.I.S. Cognitive Link Error:**\n\n\`${err.message}\`\n\n*Please ensure your Gemini API key has quota and is valid, Sir.*`;
      if (onError) onError(errorMsg);
    }
  }

  /**
   * Markdown to HUD-styled HTML parser
   */
  static renderMarkdown(text) {
    if (!text) return '';

    let html = text;

    // Escape raw HTML tags
    html = html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    // Code blocks with syntax highlighting & copy button
    html = html.replace(/```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g, (match, lang, code) => {
      const language = lang || 'plaintext';
      const cleanCode = code.trim();
      return `
<pre><div class="code-header"><span>[ ${language.toUpperCase()} ]</span><button class="copy-btn" onclick="navigator.clipboard.writeText(decodeURIComponent('${encodeURIComponent(cleanCode)}')); this.textContent='COPIED!'; setTimeout(()=>this.textContent='COPY', 1500);">COPY</button></div><code>${cleanCode}</code></pre>
      `.trim();
    });

    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3 style="color:var(--hud-cyan);margin:10px 0 6px;font-size:1.1rem;letter-spacing:1px;">$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2 style="color:var(--hud-cyan);margin:12px 0 8px;font-size:1.25rem;letter-spacing:1px;">$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1 style="color:var(--hud-cyan);margin:14px 0 10px;font-size:1.4rem;letter-spacing:2px;">$1</h1>');

    // Blockquotes
    html = html.replace(/^\> (.*$)/gim, '<blockquote style="border-left:3px solid var(--hud-gold);padding-left:10px;margin:8px 0;color:var(--hud-gold);font-style:italic;">$1</blockquote>');

    // Horizontal rules
    html = html.replace(/^---$/gim, '<hr style="border:none;border-top:1px solid var(--hud-border);margin:12px 0;">');

    // Bold & Italics
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');

    // Bullet lists
    html = html.replace(/^\* (.*$)/gim, '<li style="margin-left:20px;margin-bottom:4px;">$1</li>');
    html = html.replace(/^- (.*$)/gim, '<li style="margin-left:20px;margin-bottom:4px;">$1</li>');

    // Tables
    if (html.includes('|')) {
      const lines = html.split('\n');
      let inTable = false;
      let tableHtml = '<div style="overflow-x:auto;margin:10px 0;"><table style="width:100%;border-collapse:collapse;font-size:0.85rem;font-family:var(--font-mono);border:1px solid var(--hud-border);">';

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.startsWith('|') && line.endsWith('|')) {
          if (!inTable) {
            inTable = true;
          }
          if (line.includes(':---') || line.includes('---:')) {
            // separator line, skip
            continue;
          }
          const cells = line.split('|').slice(1, -1);
          tableHtml += '<tr>';
          cells.forEach(cell => {
            tableHtml += `<td style="padding:6px 10px;border:1px solid var(--hud-border);">${cell.trim()}</td>`;
          });
          tableHtml += '</tr>';
        } else if (inTable) {
          inTable = false;
          tableHtml += '</table></div>';
          lines[i] = tableHtml + '\n' + lines[i];
          tableHtml = '';
        }
      }
      if (inTable) {
        tableHtml += '</table></div>';
        html = lines.join('\n') + tableHtml;
      } else {
        html = lines.join('\n');
      }
    }

    // Paragraph line breaks
    html = html.replace(/\n\n/g, '</p><p>');
    html = '<p>' + html + '</p>';
    html = html.replace(/<p><\/p>/g, '');

    return html;
  }
}

window.JarvisGeminiService = JarvisGeminiService;
