//start streaming video
openStream();
function openStream() {
    let stream = new WebSocket('ws://127.0.0.1:8081/stream');
    //we recived a message
    stream.binaryType = "arraybuffer";

    stream.onmessage = (event) => {
        const blob = new Blob([event.data], { type: "image/jpeg" });
        document.getElementById("stream").src = URL.createObjectURL(blob);
    };

    stream.onopen = () => {
        log('Connected to Video stream');
      };
      
      stream.onclose = () => {
        log('Disconnected from Video stream, attempting reconnect');
        setTimeout(()=>{
            openStream();
        }, 300)
      };

}
