// server.js — servidor simples para o Railway (ou qualquer lugar com Node).
// Não usa banco nem dependência nenhuma: só entrega os arquivos da pasta /public.
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORTA = process.env.PORT || 3000;
const PASTA = path.join(__dirname, 'public');
const TIPOS = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.json': 'application/json',
};

http.createServer((req, res) => {
  let url = decodeURIComponent(req.url.split('?')[0]);
  if (url === '/' || url === '') url = '/index.html';
  const arquivo = path.normalize(path.join(PASTA, url));
  if (!arquivo.startsWith(PASTA)) { res.writeHead(403); return res.end(); } // segurança: não sai da pasta public

  fs.readFile(arquivo, (erro, conteudo) => {
    if (erro) { // qualquer endereço desconhecido volta pro site
      return fs.readFile(path.join(PASTA, 'index.html'), (e2, html) => {
        res.writeHead(e2 ? 500 : 200, { 'Content-Type': TIPOS['.html'] });
        res.end(html);
      });
    }
    res.writeHead(200, { 'Content-Type': TIPOS[path.extname(arquivo)] || 'application/octet-stream' });
    res.end(conteudo);
  });
}).listen(PORTA, '0.0.0.0', () => console.log(`CliniVet rodando na porta ${PORTA}`));
