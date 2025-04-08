
//multiple video streamse
const streams = ["", ""];

const { spawn, exec } = require('child_process');
const WebSocket = require('ws');


// Function to list available video devices from USB cameras only
function detectVideoInputs() {
  return new Promise((resolve, reject) => {
    exec('v4l2-ctl --list-devices', (error, stdout, stderr) => {
      if (error) {
        reject(`exec error: ${error}`);
        return;
      }
      if (stderr) {
        reject(`stderr: ${stderr}`);
        return;
      }

      // Parse the output to find and filter only USB video devices
      const devices = parseUsbVideoDevices(stdout);
      console.log(devices);
      resolve(devices);
    });
  });
}

// Function to parse the output from `v4l2-ctl --list-devices` and find USB cameras
function parseUsbVideoDevices(output) {
  console.log(output);
  const lines = output.split('\n');
  let isUsbCamera = false;
  let videoDeviceList = [];

  // Iterate over each line to find USB camera and video devices
  lines.forEach(line => {
    if ((line.includes('USB') || line.includes('usb')) && line.includes('Camera')) {
      // If we found a USB camera, start collecting video devices for this camera
      isUsbCamera = true;
    }

    if (isUsbCamera && line.includes('/dev/video')) {
      // Collect the first video device found for this USB camera
      videoDeviceList.push(line.trim());
      isUsbCamera = false;
    }
  });

  return videoDeviceList;
}
var alternate = 0;
function startStreams(videoDevices, startingPort) {
  videoDevices.forEach((device, index) => {
    let stream = new WebSocket.Server({ path: '/stream', port: startingPort + index });
    stream.on('connection', ws => {
      console.log('Client connected');

      const ffmpeg = spawn("ffmpeg", [
        "-f", "v4l2",                     // Set input format to v4l2 (for Linux video capture)
        "-input_format", "mjpeg",          // Input format set to MJPEG (hardware compression)
        "-framerate", "30",                // Set the frame rate
        "-video_size", "960x540",          // Set the resolution
        "-i", device,                      // The device (USB camera) input
        "-c:v", "copy",                    // Copy the video stream without re-encoding (uses onboard compression)
        "-f", "mjpeg",                     // Output format set to MJPEG (to match input format)
        "-fflags", "nobuffer",             // Reduce latency
        "-max_delay", "0",  // Remove any maximum delay (force the lowest possible latency)
"-analyzeduration", "0",        // Set analysis duration to zero (no analysis delay)
"-probesize", "32",             // Set probe size to a very small value 
        "-tune", "zerolatency",            // Tune for low-latency streaming
        "pipe:1",                          // Output to stdout (piped output)
      ]);


      ffmpeg.stdout.on('data', data => {
        

        // Send the Data URL over WebSocket
        ws.send(data);
 
      });


      ffmpeg.on('close', code => {
        console.log(`FFmpeg process exited with code ${code}`);
        ws.close();
      });

      ws.on('close', () => {
        console.log('Client disconnected');
        ffmpeg.kill('SIGTERM');  // Gracefully terminate ffmpeg process
      });

    });
  });
}
module.exports = {
  detectVideoInputs,
  startStreams
}