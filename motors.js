var i2cBus = require("i2c-bus");
var Pca9685Driver = require("pca9685").Pca9685Driver;
let setMotorImpulses = (movement) => { }
var options = {
    i2c: i2cBus.openSync(1),
    address: 0x40,
    frequency: 50,
    debug: false
};
pwm = new Pca9685Driver(options, function (err) {
    setMotorImpulses = (movement) => {
        movement.forEach((power, motor) => {
            // Set the duty cycle to 25% for channel 8
            pwm.setDutyCycle(motor, power);
        });
    }
});
module.exports = {
    setMotorImpulses
}