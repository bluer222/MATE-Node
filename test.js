const v4l2 = require('v4l2');
v4l2.listDevices()
  .then(devices => {
    console.log('Available video devices:');
    devices.forEach((device, index) => {
      console.log(`${index + 1}. ${device}`);
    });
  })