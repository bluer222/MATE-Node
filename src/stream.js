const streams = numberOfStreams;
for (let index = 0; index < streams; index++) {
  let newStream = document.createElement("canvas");
  newStream.className = "stream";
  document.body.appendChild(newStream);
  openStream(index, newStream);
}
function openStream(number, canvas) {
  const ctx = canvas.getContext('2d');
    const img = new Image();
  console.log(number);
    let socket = new WebSocket('ws://'+hostname+':' +(Number('streamPort') +number) + '/stream');
    socket.binaryType = 'arraybuffer';

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
    };

    socket.onmessage = (event) => {
      const blob = new Blob([event.data], { type: 'image/jpeg' });
      img.src = URL.createObjectURL(blob);
    };

}
