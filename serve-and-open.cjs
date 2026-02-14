/**
 * Serves the current directory on port 3001 and opens the app in the default browser.
 * Use: node serve-and-open.cjs
 * Fixes ERR_CONNECTION_REFUSED when the embedded browser can't reach localhost.
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const PORT = 3001;
const MIME = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

const server = http.createServer((req, res) => {
  let file = req.url === '/' ? '/index.html' : req.url;
  file = path.join(process.cwd(), path.normalize(file).replace(/^(\.\.(\/|\\|$))+/, ''));
  const ext = path.extname(file);
  const contentType = MIME[ext] || 'application/octet-stream';

  fs.readFile(file, (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404);
        res.end('Not found');
        return;
      }
      res.writeHead(500);
      res.end(String(err));
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
});

server.listen(PORT, '127.0.0.1', () => {
  const url = `http://127.0.0.1:${PORT}`;
  console.log('Serving at', url);
  console.log('Opening in your default browser...');
  const cmd = process.platform === 'win32' ? `start ${url}` : process.platform === 'darwin' ? `open ${url}` : `xdg-open ${url}`;
  exec(cmd, (e) => {
    if (e) console.log('Open this URL in your browser:', url);
  });
});
