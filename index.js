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
const ip = "127.0.0.1"
//port for video stream and for the file server
const filePort = 3000;
//port for the websocket server
const webSocketPort = 8080;



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





















//host the server(just dont touch it)
const server = http.createServer((req, res) => {
  //if they are accesing the stream
  if (req.url === '/stream') {
    //we have a function for this
    streamVideo(res, req, true);
  } else {
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
  }
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
//function for streaming vidoe
function streamVideo(res, req) {
  //headers, idk how it works
  res.writeHead(200, {
    'Content-Type': 'multipart/x-mixed-replace; boundary=frame',
    'Cache-Control': 'no-cache',
    'Connection': 'close',
    'Pragma': 'no-cache'
  });

  const inputFormat = [
    '-f', 'v4l2',
    '-input_format', 'mjpeg',
    '-fflags', 'nobuffer',
    '-flags', 'low_delay',
    '-strict', 'experimental',
    '-i', '/dev/video0',
    '-r', '30',
    '-q:v', '3',
    '-video_size', '4x3',
    '-f', 'image2pipe',
    '-vcodec', 'mjpeg',
    '-'
  ];

  //create an ffmpeg process to get the webcam feed
  const ffmpeg = spawn('ffmpeg', inputFormat);

  //every time ffmpeg sends a frame, send it to the client
  ffmpeg.stdout.on('data', (data) => {
    if (!res.writableEnded) {
      res.write('--frame\r\n');
      res.write('Content-Type: image/jpeg\r\n');
      res.write(`Content-Length: ${data.length}\r\n\r\n`);
      res.write(data);
      res.write('\r\n');
    }
  });
  
  //handle closing/crashing
  req.on('close', () => {
    ffmpeg.kill('SIGKILL');
  });

  ffmpeg.stderr.on('data', (data) => {
    console.error(`FFmpeg stderr: ${data}`);
  });
}