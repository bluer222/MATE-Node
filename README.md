# MATE-Node:<br>
Program in Node js to control MATE Robot through an ethernet cable for the Atlantic Owls team. <br>
### How it works:<br> 
 * Website is hosted by robot
 * Surface computer accesses website through ethernet
 * Website uses gamepad API + websockets, to send inputs down to the robot
 * Robot streams ffmpeg webcam output to surface through websockets
<br>
<h3>Usage:</h3>
<ul>
  <li>Git clone onto rasberry pi inside of robot</li>
    <li>Git clone onto rasberry pi inside of robot</li>
      <li>Set up static ip on both surface computer and rasberry pi</li>
  <li>Replace ip's in /src/main.js and /src/stream.js to the ip of the pi</li>
  <li>run npm start in the repository</li>
  <li>Connect ethernet between pi and surface computer(if not already done)</li>
    <li>go to {ip of pi}:3000 on surface computer</li>
    <li>Connect controller(not implemented)</li>
</ul>
