const streams = 2;
for (let index = 0; index < streams; index++) {
  let newStream = document.createElement("img");
  newStream.className = "stream";
  document.body.appendChild(newStream);
  openStream(index, newStream);
}
function openStream(number, element) {
  console.log(number);
    let stream = new WebSocket('ws://'+hostname+':' +(Number('streamPort') +number) + '/stream');
    //we recived a message
    stream.binaryType = "arraybuffer";
  
    stream.onmessage = (event) => {
      const arrayBuffer = event.data;
      const blob = new Blob([arrayBuffer], { type: 'image/jpeg' });  // Create a Blob with the JPEG data
      const imageURL = URL.createObjectURL(blob);  // Create a URL for the image Blob

      element.src = imageURL;  // Data URL is sent directly from the backend

    };

    stream.onopen = () => {
        log('Connected to Video stream');
      };
      
      stream.onclose = () => {
        log('Disconnected from Video stream, attempting reconnect');
        setTimeout(()=>{
            openStream(number, element);
        }, 300)
      };

}
