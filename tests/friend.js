const io = require("socket.io-client");
const fetch = require('node-fetch')
const socket = io('ws://localhost:3000');
socket.on('connect', () => {
  console.log(socket.id)
  setTimeout(async () => {
    console.log(await (await fetch('http://localhost:3000/private_room/4166', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      // body: 'sdfasdf'
      body: JSON.stringify({
        socket_id: socket.id
      })
    })));
    console.log('hurray')
  }, 5000);
});
