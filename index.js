//import stuff
//http for hosting the html
const http = require('http');
//fs+path for reading files
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');
//webcam stuff

const controller = require('./controller.js');
//const motorsJs = require('./motors.js');
const videoStream = require('./video.js');



//config
const ip = "0.0.0.0"
//port for the file server
const filePort = 3000;
//port for the websocket server
const webSocketPort = 8080;
//port for the video stream
const streamPort = 8081;
//clamp function
function clamp(val, min, max) { return Math.min(Math.max(val, min), max); }


//how much do we want to move in each direction 
let movement = {
  //positive is up, negitive is down
  upDown: 0,
  //negitive is left, positive is right
  side: 0,
  //negitive is left, positive is right
  turn: 0,
  //positive is forward, negitive is backward

  forwardBackward: 0,
};
//how much do we want to move in each direction 
let servos = [
  0
];
//how much do we want to move each motor(from -1 to 1)
//positive is forward, negitive is backward
let motors = [0, 0, 0, 0, 0, 0];
controller.buttonMapping.addListener((e) => {
  //x1
  if (e.id === 6) {
    servos[0] = 0.008 + (0.135 - 0.008) * e.value;
  }
  motorsJs.setServoImpulses(servos, motorsJs.pwm);
});

controller.axesMapping.addListener((e) => {
  console.log(e);
  //x1
  if (e.id === 0) {
    movement.turn = e.value;
  }
  ///y1
  if (e.id === 1) {
    movement.upDown = -e.value;
  }
  //x2
  if (e.id === 2) {
    movement.side = e.value;
  }
  //y2
  if (e.id === 3) {
    movement.forwardBackward = -e.value;
  }
  calculateMotorImpulses(movement);
});

function calculateMotorImpulses(movement) {
  //use your brain and motormap.png
  motors[1] = clamp(movement.forwardBackward - movement.turn + movement.side, -1, 1);
  motors[2] = clamp(movement.forwardBackward + movement.turn - movement.side, -1, 1);
  motors[3] = clamp(-movement.forwardBackward + movement.turn + movement.side, -1, 1);
  motors[4] = clamp(-movement.forwardBackward - movement.turn - movement.side, -1, 1);
  motors[5] = clamp(movement.upDown, -1, 1);
  motors[6] = clamp(movement.upDown, -1, 1);
  //send to motors 
  motorsJs.setMotorImpulses(motors, motorsJs.pwm);
  console.log(motors);
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



videoStream.detectVideoInputs().then((cameras)=>{

  console.log(cameras);
  videoStream.startStreams(cameras, streamPort);
  

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
          let newdata = data.toString().replace('webSocketPort', webSocketPort).replace('streamPort', streamPort).replace('numberOfStreams', cameras.length);
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
});








