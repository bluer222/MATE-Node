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
function setMotorImpulses(motors, pwm) {
    motors.forEach((power, motor) => {
        // Set the duty cycle to 25% for channel 8
        pwm.setPulseLength(motor,  (power));

    });
}
function inputToPulse(input) {
    return Math.round(1600 + (400 * input));
}
function setServoImpulses(servos, pwm) {
    servos.forEach((power, servo) => {
        power = roundWithPersision(power, 10000)
        console.log(servo, power);
        // Set the duty cycle to 25% for channel 8
        pwm.setDutyCycle(servo+6, power);

    });
}
function roundWithPersision(num, precision) {
    return Math.round(num * precision) / precision;
}
module.exports = {
    pwm,
    setMotorImpulses,
    setServoImpulses
}