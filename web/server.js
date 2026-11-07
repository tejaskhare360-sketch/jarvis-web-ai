/**
 * J.A.R.V.I.S. Local Development Server
 * Zero external npm dependencies required! Uses native Node.js http, fs, and path modules.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = __dirname;

// Read .env if it exists
let envApiKey = process.env.GEMINI_API_KEY || '';
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  for (const line of envContent.split('\n')) {
    const match = line.match(/^\s*GEMINI_API_KEY\s*=\s*(.*)?\s*$/);
    if (match) {
      envApiKey = match[1].replace(/['"]/g, '').trim();
    }
  }
}

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff'
};

const server = http.createServer((req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  let pathname = parsedUrl.pathname;

  // Endpoint to pass server-side environment key to client if set
  if (pathname === '/api/config') {
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    });
    res.end(JSON.stringify({
      hasEnvKey: !!envApiKey,
      isProxyActive: !!envApiKey,
      apiKey: envApiKey
    }));
    return;
  }

  // Server-side chat proxy matching Vercel serverless function
  if (pathname === '/api/chat') {
    if (req.method === 'OPTIONS') {
      res.writeHead(200, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-API-Key'
      });
      res.end();
      return;
    }

    if (req.method === 'POST') {
      let bodyData = '';
      req.on('data', chunk => { bodyData += chunk; });
      req.on('end', async () => {
        try {
          const body = JSON.parse(bodyData || '{}');
          const key = envApiKey || req.headers['x-api-key'] || body.apiKey;
          if (!key) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'GEMINI_API_KEY required' }));
            return;
          }

          const model = body.model || 'gemini-2.5-flash';
          const targetUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${key}`;

          const upstream = await fetch(targetUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: body.contents,
              systemInstruction: body.systemInstruction,
              generationConfig: body.generationConfig
            })
          });

          if (!upstream.ok) {
            const errText = await upstream.text();
            res.writeHead(upstream.status, { 'Content-Type': 'application/json' });
            res.end(errText);
            return;
          }

          res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache, no-transform',
            'Connection': 'keep-alive',
            'Access-Control-Allow-Origin': '*'
          });

          const reader = upstream.body.getReader();
          const decoder = new TextDecoder('utf-8');
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            res.write(decoder.decode(value, { stream: true }));
          }
          res.end();
        } catch (err) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: err.message }));
        }
      });
      return;
    }
  }

  if (pathname === '/' || pathname === '/web' || pathname === '/web/') {
    pathname = '/index.html';
  }

  let safePath = path.normalize(pathname).replace(/^(\.\.[\/\\])+/, '');
  if (safePath.startsWith('/web/')) {
    safePath = safePath.replace(/^\/web\//, '/');
  } else if (safePath.startsWith('web/')) {
    safePath = safePath.replace(/^web\//, '');
  }

  const filePath = path.join(PUBLIC_DIR, safePath);

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found // J.A.R.V.I.S. Security Protocol');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache'
    });

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`
========================================================================
             STARK INDUSTRIES // J.A.R.V.I.S. HUD SERVER
========================================================================
  ⚡ Mark LXXXV Architecture: ONLINE
  🌐 Local Holographic Link:  http://localhost:${PORT}
  🔑 Environment API Key:     ${envApiKey ? 'DETECTED FROM .env' : 'NOT SET (Can enter via web HUD)'}
========================================================================
`);
});
