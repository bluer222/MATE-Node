//import stuff
const http = require('http');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');


//host it
const hostname = '127.0.0.2';
const port = 3000;
const wss = new WebSocket.Server({ port: 8080 });
wss.on('connection', (ws) => {
  console.log('Client connected');

  ws.on('message', (message) => {

    message = JSON.parse(message);

    console.log('Received message:', message.type);
    if (message.type === "ping") {
      send('pong', 'pong');

    } else {

    }
    //ws.send('Hello from the server!');
  });
  function send(type, data) {
    ws.send(JSON.stringify({ type, data }));
  }
  ws.on('close', () => {
    console.log('Client disconnected');
  });
});


//update temperature/ph/whatever
//ws.send(temp);





















//host the server(just dont touch it)
const server = http.createServer((req, res) => {
  const filePath = path.join(__dirname, 'src', req.url);

  fs.access(filePath, (err) => {
    if (err) {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'text/plain');
      res.end('File not found');
    } else {
      fs.readFile(filePath, (err, data) => {
        if (err) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'text/plain');
          res.end('Error reading file');
        } else {
          res.statusCode = 200;
          res.setHeader('Content-Type', getContentType(filePath));
          res.end(data);
        }
      });
    }
  });
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});

const getContentType = (filePath) => {
  const extname = path.extname(filePath);
  switch (extname) {
    case '.html':
      return 'text/html';
    case '.css':
      return 'text/css';
    case '.js':
      return 'text/javascript';
    case '.png':
      return 'image/png';
    case '.jpg':
      return 'image/jpeg';
    default:
      return 'application/octet-stream';
  }
};