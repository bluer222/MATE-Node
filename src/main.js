//connection
let socket;
let pingTime = 0;
//messages that we tried to send but werent connected
let sendBuffer = [];
//open connection to server
openSocket();
function openSocket() {
    socket = new WebSocket('ws://127.0.0.2:8080');

    //when we finish connecting
    socket.onopen = () => {
        //send any buffered messages
        if (sendBuffer.length > 0) {
            sendBuffer.forEach((message) => {
                socket.send(message);
            });
            sendBuffer = [];
        }
        console.log('Connected to WebSocket server');
    };

    //we recived a message
    socket.onmessage = (event) => {
        //pares it
        let message = JSON.parse(event.data);
        //log it
        console.log('Received message:', message);
        //handle it
        if (message.type === "pong") {
            log("Ping took " + (performance.now() - pingTime) + "ms");
        }
    };

    //the socked got disconnected(this is bad)
    socket.onclose = () => {
        console.log('Disconnected from WebSocket server');
        log("Disconnected from server(bad)");
    };
}

//check if the server is still there and how long it takes to get a response
function ping() {
    pingTime = performance.now();
    console.log("pinging");
    send("ping", "ping");
}

//connect a controller
let controller = navigator.getGamepads()[0];
//send button presses
window.addEventListener('gamepadbuttondown', (event) => {
    console.log('Button pressed:', event.detail.button);
    send("button", event.detail.button);
});
//send stick movements
window.addEventListener('gamepadaxismove', (event) => {
    console.log('Axis moved:', event.detail.axis, event.detail.value);
    send("axis", { axis: event.detail.axis, value: event.detail.value });
});

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
    let cons = document.getElementById('console');
    const br = document.createElement('br');
    cons.prepend(text, br);
}