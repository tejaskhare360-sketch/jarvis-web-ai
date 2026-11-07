/**
 * Vercel Serverless Function: /api/chat
 * Streams Google Gemini responses securely using server-side GEMINI_API_KEY.
 */

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-API-Key');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY || req.headers['x-api-key'] || req.body?.apiKey;
  if (!apiKey) {
    return res.status(400).json({
      error: 'GEMINI_API_KEY not found. Please configure it in your Vercel Environment Variables or web HUD Settings.'
    });
  }

  const model = req.body?.model || 'gemini-2.5-flash';
  const targetUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${apiKey}`;

  const payload = {
    contents: req.body?.contents || [],
    systemInstruction: req.body?.systemInstruction,
    generationConfig: req.body?.generationConfig || {
      temperature: 0.7,
      topP: 0.95,
      maxOutputTokens: 2048
    }
  };

  try {
    const upstreamRes = await fetch(targetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!upstreamRes.ok) {
      const errText = await upstreamRes.text();
      return res.status(upstreamRes.status).send(errText);
    }

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*'
    });

    const reader = upstreamRes.body.getReader();
    const decoder = new TextDecoder('utf-8');

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      res.write(chunk);
    }

    res.end();
  } catch (err) {
    console.error('Vercel API chat stream error:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: err.message });
    } else {
      res.end();
    }
  }
};
