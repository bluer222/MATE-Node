
//get 2d canvas context of controllerVisulizer canvas
const canvas = document.getElementById("controllerVisulizer");
const ctx = canvas.getContext("2d");
ctx.fillStyle = "black";
ctx.strokeStyle = "black";
class mapping {
    constructor() {
        this.ids = {};
        this.mappings = {};
        this.value = {};
        this.listeners = [];
    }

    addMapping(id, mapping) {
        this.ids[mapping] = id;
        this.mappings[id] = mapping;
        this.value[id] = 0;
        this.notifyListeners(id, 0, "add"); // Tell everyone about the change
    }

    setI(id, value) {
        console.log(value);
        this.value[id] = value;
        this.notifyListeners(id, value, "set"); // Tell everyone about the change
    }

    setM(mapping, value) {
        this.setI(this.ids[mapping], value);
        this.notifyListeners(this.ids[mapping], value, "set"); // Tell everyone about the change
    }

    getI(id) {
        return this.value[id];
    }

    getM(mapping) {
        return this.getI(this.ids[mapping]);
    }

    addListener(listener) {
        this.listeners.push(listener);
    }


    notifyListeners(id, value, action) {
        this.listeners.forEach((listener) => {
            listener({ id, button: this.mappings[id], value, action }); // Call each function with info about the change
        });
    }
}
const buttonMapping = new mapping();
buttonMapping.addMapping(0, "x");
buttonMapping.addMapping(1, "circle");
buttonMapping.addMapping(2, "square");
buttonMapping.addMapping(3, "triangle");
buttonMapping.addMapping(4, "l1");
buttonMapping.addMapping(5, "r1");
buttonMapping.addMapping(6, "l2");
buttonMapping.addMapping(7, "r2");
buttonMapping.addMapping(8, "share");
buttonMapping.addMapping(9, "options");
buttonMapping.addMapping(12, "up");
buttonMapping.addMapping(13, "down");
buttonMapping.addMapping(14, "left");
buttonMapping.addMapping(15, "right");

const axesMapping = new mapping();
axesMapping.addMapping(0, "x");
axesMapping.addMapping(1, "y");
axesMapping.addMapping(2, "x2");
axesMapping.addMapping(3, "y2");

var controller = {
    "l1": {
        height: 10,
        width: 20,
        x: 50,
        y: 20,
    },
    "l2": {
        height: 10,
        width: 20,
        x: 50,
        y: 0,
    },
    "r1": {
        height: 10,
        width: 20,
        x: 250,
        y: 20,
    },
    "r2": {
        height: 10,
        width: 20,
        x: 250,
        y: 0,
    },
    "up": {
        height: 10,
        width: 10,
        x: 50,
        y: 50,
    },
    "down": {
        height: 10,
        width: 10,
        x: 50,
        y: 100,
    },
    "left": {
        height: 10,
        width: 10,
        x: 25,
        y: 75,
    },
    "right": {
        height: 10,
        width: 10,
        x: 75,
        y: 75,
    },
    "share": {
        height: 10,
        width: 5,
        x: 100,
        y: 50,
    },
    "options": {
        height: 10,
        width: 5,
        x: 200,
        y: 50,
    },
    "triangle": {
        height: 10,
        width: 10,
        x: 250,
        y: 50,
    },
    "x": {
        height: 10,
        width: 10,
        x: 250,
        y: 100,
    },
    "square": {
        height: 10,
        width: 10,
        x: 225,
        y: 75,
    },
    "circle": {
        height: 10,
        width: 10,
        x: 275,
        y: 75,
    },
    "a1": {
        radius: 30,
        x: 100,
        y: 150,
    },
    "a2": {
        radius: 30,
        x: 200,
        y: 150,
    },
};

//detect controllers
let gamepadIndex = 0;
window.addEventListener("gamepadconnected", (event) => {
    //store the index
    gamepadIndex = event.gamepad.index;
    //start the update loop
    updateController();
});

function updateController() {
    //get up-to-date controller data
    let controller = navigator.getGamepads()[gamepadIndex];
    let naxes = controller.axes;
    let nbuttons = controller.buttons;
    //find changes and send them
    naxes.forEach((naxis, index) => {
        naxis = stickCentering(naxis)
        if (naxis != axesMapping.getI(index)) {
            axesMapping.setI(index, naxis);
        }
    });
    nbuttons.forEach((nbutton, index) => {
        if (nbutton.value != buttonMapping.getI(index)) {
            buttonMapping.setI(index, nbutton.value);
        }
    });

    displayController();
    //loop
    requestAnimationFrame(updateController);
}


function displayController() {
    //clear the screen
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    //draw the controller
    for (let button in controller) {
        if (button == "a1" || button == "a2") {
            ctx.beginPath();
            ctx.arc(controller[button].x, controller[button].y, controller[button].radius, 0, 2 * Math.PI);
            ctx.moveTo(controller[button].x, controller[button].y);
            if(button =="a1"){
                ctx.lineTo(controller[button].x + axesMapping.getM("x") * 30, controller[button].y + axesMapping.getM("y") * 30);
            }else{
                ctx.lineTo(controller[button].x + axesMapping.getM("x2") * 30, controller[button].y + axesMapping.getM("y2") * 30);
            }
            
            ctx.stroke();
        } else {
            if (buttonMapping.getM(button)) {
                ctx.fillRect(controller[button].x, controller[button].y, controller[button].width, controller[button].height);
            } else {
                ctx.strokeRect(controller[button].x, controller[button].y, controller[button].width, controller[button].height);
            }
        }
    }
}
buttonMapping.addListener((event) => {
console.log("buttonUpdate " + event.id);
send("buttonUpdate", event);
});

axesMapping.addListener((event) => {
    console.log("axisUpdate: " + event.value);
    send("axisUpdate", event);

});

function stickCentering(number) {
    // Check if the number is between -0.02 and 0.02
    if (number > -0.02 && number < 0.02) {
      // If it is, return 0
      return 0;
    } else {
      // If it's not, return the original number
      return number;
    }
  }