var i2cBus = require("i2c-bus");
var Pca9685Driver = require("pca9685").Pca9685Driver;

var options = {
    i2c: i2cBus.openSync(1),
    address: 0x40,
    frequency: 50,
    debug: false
};
var power = 0;
pwm = new Pca9685Driver(options, function (err) {
    if (err) {
        console.error("Error initializing PCA9685");
        process.exit(-1);
    }

//setInterval(()=>{
            pwm.setDutyCycle(0, 1);

//console.log(power);
//power += 0.1;
//if(power > 1){
//power = 0;
//}
//}, 1000);

});