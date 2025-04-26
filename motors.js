const { get } = require("http");
var i2cBus = require("i2c-bus");
var Pca9685Driver = require("pca9685").Pca9685Driver;
var powerUsageByPWM = [20.71,20.63,20.47,19.9,19.45,18.96,18.39,18,17.37,16.96,16.54,16.04,15.64,15.19,14.71,14.33,13.93,13.57,13.1,12.7,12.4,11.9,11.6,11.3,11,10.6,10.36,9.93,9.67,9.33,9,8.7,8.4,8,7.7,7.4,7.04,6.8,6.5,6.29,6,5.77,5.5,5.34,5.1,4.9,4.7,4.5,4.29,4.1,3.9,3.7,3.5,3.3,3.2,3,2.9,2.7,2.5,2.3,2.2,2,1.9,1.7,1.6,1.5,1.4,1.3,1.2,1.1,1,0.9,0.8,0.8,0.7,0.6,0.5,0.5,0.4,0.4,0.3,0.3,0.2,0.2,0.2,0.11,0.1,0.1,0.05,0.05,0.05,0.05,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0.05,0.05,0.05,0.01,0.1,0.1,0.13,0.2,0.2,0.2,0.3,0.4,0.4,0.44,0.5,0.6,0.7,0.7,0.8,0.9,1,1,1.18,1.3,1.34,1.5,1.6,1.7,1.8,1.9,2.1,2.2,2.3,2.56,2.8,2.9,3.1,3.2,3.4,3.57,3.7,3.9,4.1,4.31,4.51,4.79,5,5.2,5.4,5.6,5.8,6.1,6.3,6.57,6.8,7.1,7.4,7.74,8.09,8.4,8.7,8.95,9.39,9.6,10,10.3,10.6,10.86,11.29,11.57,11.9,12.3,12.6,12.95,13.37,13.72,14.14,14.5,14.96,15.36,15.89,16.24,16.72,17.18,17.65,18.08,18.63,19.08,19.56,20.07,20.29,20.36];
function getPowerUsage(pwm) {
    pwm = Math.round((pwm-1100)/4);
    return powerUsageByPWM[pwm];
}
var options = {
    i2c: i2cBus.openSync(1),
    address: 0x40,
    frequency: 50,
    debug: false
};
pwm = new Pca9685Driver(options, function (err) {

});
function scaleMotorPower(motors) {
    var totalPower = 0;
    motors.forEach((power, motor) => {
        power = inputToPulse(power);
        totalPower += getPowerUsage(power);
    });
    var scale = 25/totalPower;
    if(scale > 1) {
        scale = 1;
    }
    motors.forEach((power, motor) => {
        power = Math.round(power*scale);
    });
}
function setMotorImpulses(motors, pwm) {
    motors.forEach((power, motor) => {
        // Set the duty cycle to 25% for channel 8
        pwm.setPulseLength(motor,  power+100);

    });
}
function inputToPulse(input) {
    return Math.round(1500 + (400 * input));
}
function setServoImpulses(servos, pwm) {
    servos.forEach((power, servo) => {
        power = roundWithPersision(power, 10000)
        console.log(servo, power);
        // Set the duty cycle to 25% for channel 8
        pwm.setDutyCycle(servo+14, power);

    });
}
function roundWithPersision(num, precision) {
    return Math.round(num * precision) / precision;
}
module.exports = {
    pwm,
    setMotorImpulses,
    setServoImpulses,
    getPowerUsage
}