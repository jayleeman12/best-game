const io = require("socket.io-client");
const fetch = require('node-fetch')
const socket = io('ws://localhost:3000');
socket.on('connect', () => {
  console.log(socket.id)
  setTimeout(async () => {
    console.log(await (await fetch('http://localhost:3000/private_room/1747/public', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
    })).json());
  }, 5000);
});
