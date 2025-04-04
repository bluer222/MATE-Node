var i2cBus = require("i2c-bus");
var Pca9685Driver = require("pca9685").Pca9685Driver;

var options = {
    i2c: i2cBus.openSync(1),
    address: 0x40,
    frequency: 50,
    debug: false
};
pwm = new Pca9685Driver(options, function (err) {

});
function setMotorImpulses(movement, pwm) {
        movement.forEach((power, motor) => {
power = roundWithPersision(power, 10000)
	console.log(motor, power);
            // Set the duty cycle to 25% for channel 8
            pwm.setDutyCycle(motor, power);

        });
    }
function setServoImpulses(movement, pwm) {
        movement.forEach((power, motor) => {
power = roundWithPersision(power, 10000)
	console.log(motor, power);
            // Set the duty cycle to 25% for channel 8
            pwm.setDutyCycle(motor, power);

        });
    }
function roundWithPersision(num, precision){
return Math.round(num*precision)/precision;
}
module.exports = {
pwm,
    setMotorImpulses,
setServoImpulses
}