const io = require("socket.io-client");
const fetch = require('node-fetch')
const socket = io('ws://localhost:3000');
socket.on('connect', () => {
  console.log(socket.id)
  setTimeout(async () => {
    console.log(await (await fetch('http://localhost:3000/join_room', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      // body: 'sdfasdf'
      body: JSON.stringify({
        socket_ids: [socket.id]
      })
    })).json());
  }, 5000);
});
