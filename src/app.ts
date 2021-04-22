import express from "express";
import { createServer } from 'http';
import { Server, Socket } from "socket.io";
import { json as jsonBodyParser, urlencoded } from 'body-parser';
import { resolveProjectReferencePath } from "typescript";
import { getRoomId, releaseRoom } from "./utils";


const MAX_PLAYERS_IN_ROOM = 4

const app = express();
app.use(jsonBodyParser())
app.use(urlencoded({ extended: true }))
app.set("port", process.env.PORT || 3000);

const httpServer = createServer(app);
const io = new Server(httpServer);

const rooms = [];
const privateRooms = [];


function addToRoom(socketId: string): number {
  for(let i = 0; i < rooms.length; i++) {
    const room = rooms[i]
    if (room.members.length < 4) {
      room.members.push(socketId)
      // TODO: duplicate code here
      io.sockets.sockets.get(socketId).join(room.id.toString());
      return room.id
    }
  }
  const roomId = getRoomId()
  rooms.push({
    id: roomId,
    members: [socketId]
  });
  io.sockets.sockets.get(socketId).join(roomId.toString());
  return roomId;
}

app.post("/join_room", (req: express.Request, res: express.Response) => {
  const socketId: string = req.body.socket_ids;
  const roomId = addToRoom(socketId);
  return res.json({roomId: roomId})
});


app.post("/private_room", (req: express.Request, res: express.Response) => {
  const socketId = req.body.socket_id;
  const roomId = getRoomId()
  privateRooms.push({
    id: roomId,
    members: [socketId]
  });
  return res.json({roomId: roomId});
});

app.post("/private_room/:id", (req: express.Request, res: express.Response) => {
  const socketId = req.body.socket_id;
  const privateRoomId = req.params.id;
  const privateRoom = privateRooms.find(room => room.id.toString() === privateRoomId)
  if (privateRoom && privateRoom.members.length < 4) {
    privateRoom.members.push(socketId);
    return res.sendStatus(200);
  }
  return res.sendStatus(409);
});


app.post("/private_room/:id/public", (req: express.Request, res: express.Response) => {
  const privateRoomId = req.params.id;
  const privateRoomIndex = privateRooms.findIndex(room => room.id === privateRoomId);
  const privateRoom = privateRooms[privateRoomIndex];
  privateRoom.members.forEach(member => {
    addToRoom(member)
  });
  privateRooms.splice(privateRoomIndex, 1);
});

io.on("connection", function (socket: Socket) {
  const socketId = socket.id;
  socket.on('disconnect', () => {
    const roomIndex = rooms.findIndex(room => room.members.includes(socketId));
    if (roomIndex === -1) {
      return
    }
    const room = rooms[roomIndex];
    room.members.splice(room.members.findIndex(member => member === socketId), 1);
    if (room.members.length === 0) {
      releaseRoom(room.id)
      rooms.splice(roomIndex, 1);
    }
  });
});

const server = httpServer.listen(3000, function () {
  console.log("listening on *:3000");
});

// post 1,
// post 2,
// rooms = [123: [1,2,3]]