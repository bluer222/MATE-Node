//import stuff
//http for hosting the html
const http = require('http');
//fs+path for reading files
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');
//webcam stuff
const { spawn } = require('child_process');


//config
const ip = "0.0.0.0"
//port for video stream and for the file server
const filePort = 3000;
//port for the websocket server
const webSocketPort = 8080;
//port for the websocket server
const streamPort = 8081;



//websockets
const wss = new WebSocket.Server({ port: webSocketPort });
wss.on('connection', (ws) => {
  console.log('Client connected');

  ws.on('message', (message) => {
    //parse
    message = JSON.parse(message);

    //log
    console.log('Received message:', message.type);

    //respond
    if (message.type === "ping") {
      send('pong', 'pong');

    } else {

    }
  });
  //function for sending messages
  function send(type, data) {
    ws.send(JSON.stringify({ type, data }));
  }
  ws.on('close', () => {
    console.log('Client disconnected');
  });
});


//update temperature/ph/whatever
//ws.send(temp);


//stream
const stream = new WebSocket.Server({ path: '/stream', port: streamPort });
stream.on('connection', ws => {
  console.log('Client connected');

  const ffmpeg = spawn("ffmpeg", [
    "-f", "v4l2",
    "-input_format", "mjpeg",
    "-framerate", "30",
    "-video_size", "640x480",
    "-i", "/dev/video0",
    "-f", "mjpeg",
    "-fflags", "nobuffer",
    "-tune", "zerolatency",
    //"-q:v", "10",
    "pipe:1",

]);


  ffmpeg.stdout.on('data', data => {
    ws.send(data);
  });

  ffmpeg.stderr.on('data', data => {
    console.error(`FFmpeg stderr: ${data}`);
  });

  ffmpeg.on('close', code => {
    console.log(`FFmpeg process exited with code ${code}`);
    ws.close();
  });

  ws.on('close', () => {
    console.log('Client disconnected');
    ffmpeg.kill();
  });
});


















//host the server(just dont touch it)
const server = http.createServer((req, res) => {
  //if they are accesing the stream
    //otherwize
    //find the file
    const filePath = path.join(__dirname, 'src', req.url);
    fs.access(filePath, (err) => {
      //if the file exists then send it
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
//start ruinning the server
server.listen(filePort, ip, () => {
  console.log(`Server running at http://${ip}:${filePort}/`);
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
