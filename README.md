# MATE-Node:<br>
Program in Node js to control MATE Robot through an ethernet cable for the Atlantic Owls team. <br>
### How it works:<br> 
 * Website is hosted by robot
 * Surface computer accesses website through ethernet
 * Website uses gamepad API + websockets, to send inputs down to the robot
 * Robot uses mjpeg stream to send up video
<br>
<h3>Usage:</h3>
<ul>
  <li>Git clone onto rasberry pi inside of robot</li>
  <li>Cd into repository and run npm start</li>
  <li>Connect ethernet between pi and surface computer(if not already done)</li>
    <li>go to 127.0.0.1:3000 on surface computer</li>
    <li>Connect controller(not implemented)</li>
</ul>
