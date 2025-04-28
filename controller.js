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
    resetValues() {
        for (let id in this.ids) {
            this.setI(id, 0);
        }
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

function buttonUpdate(event) {
    buttonMapping.setI(event.id, event.value);
}
function axisUpdate(event) {
    axesMapping.setI(event.id, event.value);
}

module.exports = {
    buttonUpdate,
    axisUpdate,
    buttonMapping,
    axesMapping,
    controller
};