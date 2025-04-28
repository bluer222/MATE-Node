//connection
let socket;
let pingTime = 0;
let hostname = document.location.hostname;
//open connection to server
openSocket();
function openSocket() {
    socket = new WebSocket('ws://' + hostname + ':webSocketPort');
    //when we finish connecting
    socket.onopen = () => {
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
        if (message.type === "log") {
            log(message.data);
        }
    };

    //the socked got disconnected(this is bad)
    socket.onclose = () => {
        log('Disconnected from controller stream(very bad)');
        setTimeout(()=>{
            openSocket();
        }, 300)
    };
}

//check if the server is still there and how long it takes to get a response
function ping() {
    pingTime = performance.now();
    send("ping", "ping");
}
function update() {
    send("update", "update");
}


//send a message to the server
function send(type, data) {
    try{
    //if the socket is open
    if (socket.readyState === WebSocket.OPEN) {
        //send it
        socket.send(JSON.stringify({ type, data }));
    }
    }catch(e){
        log("Error sending message: " + e);
    }
}

//log something in the visible console
function log(text) {
    console.log(text);
    let cons = document.getElementById('console');
    const br = document.createElement('br');
    cons.prepend(text, br);
}

