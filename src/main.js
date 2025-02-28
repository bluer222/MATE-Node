//connection
let socket;
let pingTime = 0;
//messages that we tried to send but werent connected
let sendBuffer = [];


//open connection to server
openSocket();
function openSocket() {
    socket = new WebSocket('ws://127.0.0.1:8080');

    //when we finish connecting
    socket.onopen = () => {
        //send any buffered messages
        if (sendBuffer.length > 0) {
            sendBuffer.forEach((message) => {
                socket.send(message);
            });
            sendBuffer = [];
        }
        log('Connected to server');
    };

    //we recived a message
    socket.onmessage = (event) => {
        //parse it
        let message = JSON.parse(event.data);
        //handle it
        if (message.type === "pong") {
            log("Ping took " + (performance.now() - pingTime) + "ms");
        }
    };

    //the socked got disconnected(this is bad)
    socket.onclose = () => {
        log("Disconnected from server(bad)");
    };
}

//check if the server is still there and how long it takes to get a response
function ping() {
    pingTime = performance.now();
    send("ping", "ping");
}
//detect controllers
let gamepadIndex = 0;
window.addEventListener("gamepadconnected", (event) => {
    //store the index and get init values
    gamepadIndex = event.gamepad.index;
    let controller = navigator.getGamepads()[gamepadIndex];
    let naxes = controller.axes;
    let nbuttons = controller.buttons;
    axes = naxes;
    buttons = nbuttons;
    //start the update loop
    updateController();
});
//most recent controlelr data
let axes = [];
let buttons = [];

function updateController() {
    //get up-to-date controller data
    let controller = navigator.getGamepads()[gamepadIndex];
    let naxes = controller.axes;
    let nbuttons = controller.buttons;
    let changedAxes = [];
    let changedButtons = [];
    //find changes and send them
    naxes.forEach((naxis, index) => {
        if (naxis != axes[index]) {
            changedAxes.push({ index, value: naxis });
        }
    });
    if (changedAxes.length > 0) {
        gamepadAxisMove(changedAxes);
        axes = naxes;
    }
    nbuttons.forEach((nbutton, index) => {
        if (nbutton.pressed != buttons[index].pressed) {
            changedButtons.push({ index, value: nbutton.pressed });
        }
    });
    if (changedButtons.length > 0) {
        gamepadButtonDown(changedButtons);
        buttons = nbuttons;
    }
    //loop
    requestAnimationFrame(updateController);
}

//send stick movements
function gamepadAxisMove(axes) {
    console.log('Axis moved:', axes);
};
//send button presses
function gamepadButtonDown(changedButtons) {
    console.log('Button pressed:', changedButtons);
    document.getElementById("controllerInfo").innerHTML = changedButtons;
};

//send a message to the server
function send(type, data) {
    //oh no it closed
    if (socket.readyState === WebSocket.CLOSED) {
        //quick, buffer it and reconect before anyone notices
        sendBuffer.push(JSON.stringify({ type, data }));
        openSocket();
    } else {
        //send it
        socket.send(JSON.stringify({ type, data }));
    }
}

//log something in the visible console
function log(text) {
    console.log(text);
    let cons = document.getElementById('console');
    const br = document.createElement('br');
    cons.prepend(text, br);
}

