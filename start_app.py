from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
import argparse

parser = argparse.ArgumentParser()
parser.add_argument('--port', type=int, default=8765)
args = parser.parse_args()

class NoCacheHTTPRequestHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

server = ThreadingHTTPServer(('127.0.0.1', args.port), NoCacheHTTPRequestHandler)
print(f'Website beschikbaar op http://127.0.0.1:{args.port}', flush=True)
server.serve_forever()
