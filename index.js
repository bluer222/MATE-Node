//import stuff
//http for hosting the html
const http = require('http');
//fs+path for reading files
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');
//webcam stuff
const { spawn } = require('child_process');

const controller = require('./controller.js');

//config
const ip = "0.0.0.0"
//port for the file server
const filePort = 3000;
//port for the websocket server
const webSocketPort = 8080;
//port for the video stream
const streamPort = 8081;

//clamp function
function clamp(val, min, max){ return Math.min(Math.max(val, min), max);}


//how much do we want to move in each direction 
let movement ={
  //positive is up, negitive is down
  upDown: 0,
    //negitive is left, positive is right
    side: 0,
    //negitive is left, positive is right
  turn: 0,
    //positive is forward, negitive is backward

  forwardBackward: 0,
};
controller.buttonMapping.addListener((e)=>{

});

controller.axesMapping.addListener((e)=>{
  console.log(e);
  //x1
  if(e.id === 0){
    movement.turn = e.value;
  }
  ///y1
  if(e.id === 1){
    movement.upDown = -e.value;
  }
  //x2
  if(e.id === 2){
    movement.side = e.value;
  }
  //y2
  if(e.id === 3){
    movement.forwardBackward = -e.value;
  }
calculateMotorImpulses(movement);
});

function calculateMotorImpulses(movement){
  //use your brain and motormap.png
  let motor1 = clamp(movement.forwardBackward - movement.turn + movement.side, -1, 1);
  let motor2 = clamp(movement.forwardBackward + movement.turn - movement.side, -1, 1);
  let motor3 = clamp(-movement.forwardBackward + movement.turn + movement.side, -1, 1);
  let motor4 = clamp(-movement.forwardBackward - movement.turn - movement.side, -1, 1);
  let motor5 = clamp(movement.upDown, -1, 1);
  let motor6 = clamp(movement.upDown, -1, 1);

  console.log(motor1 +", "+ motor2+", "+ motor3+", "+ motor4+", "+ motor5+", "+ motor6);
}

//websockets
const wss = new WebSocket.Server({ port: webSocketPort });
wss.on('connection', (ws) => {
  console.log('Client connected');

  ws.on('message', (message) => {
    //parse
    message = JSON.parse(message);

    //handle
    if (message.type === "buttonUpdate") {
      controller.buttonUpdate(message.data);
    } else if (message.type === "axisUpdate") {
      controller.axisUpdate(message.data);
    } else if (message.type === "ping") {
      send('pong', 'pong');

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
  /*
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
    */
});


















//host the server(just dont touch it)
const server = http.createServer((req, res) => {
  //find the file
  const filePath = path.join(__dirname, 'src', req.url);
  fs.access(filePath, (err) => {
    //if the file exists then send it
    if (err) {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'application/json');
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
          let newdata = data.toString().replace('webSocketPort', webSocketPort).replace('streamPort', streamPort);
          res.end(newdata);
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