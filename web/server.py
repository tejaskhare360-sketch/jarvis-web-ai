#!/usr/bin/env python3
"""
J.A.R.V.I.S. Python HTTP Server
Launch with: python3 server.py [PORT]
"""

import os
import sys
import json
from http.server import HTTPServer, SimpleHTTPRequestHandler

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 3000
WEB_DIR = os.path.dirname(os.path.abspath(__file__))

# Read .env if present
env_api_key = os.environ.get("GEMINI_API_KEY", "")
env_path = os.path.join(WEB_DIR, ".env")
if os.path.exists(env_path):
    try:
        with open(env_path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line.startswith("GEMINI_API_KEY="):
                    env_api_key = line.split("=", 1)[1].strip().strip('"').strip("'")
    except Exception:
        pass

class JarvisHTTPHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=WEB_DIR, **kwargs)

    def do_GET(self):
        if self.path == "/api/config":
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            data = json.dumps({"hasEnvKey": bool(env_api_key), "apiKey": env_api_key})
            self.wfile.write(data.encode("utf-8"))
            return
        return super().do_GET()

    def end_headers(self):
        # Disable browser caching during development
        self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
        super().end_headers()

if __name__ == "__main__":
    os.chdir(WEB_DIR)
    httpd = HTTPServer(("", PORT), JarvisHTTPHandler)
    print(f"""
========================================================================
             STARK INDUSTRIES // J.A.R.V.I.S. HUD SERVER (PYTHON)
========================================================================
  ⚡ Mark LXXXV Architecture: ONLINE
  🌐 Local Holographic Link:  http://localhost:{PORT}
  🔑 Environment API Key:     {'DETECTED FROM .env' if env_api_key else 'NOT SET (Can enter via web HUD)'}
========================================================================
""")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n[J.A.R.V.I.S.] Server standing down. Systems offline.")
        sys.exit(0)
