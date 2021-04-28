import express from "express";
import { createServer } from 'http';
import { Server, Socket } from "socket.io";
import { json as jsonBodyParser, urlencoded } from 'body-parser';
import { resolveProjectReferencePath } from "typescript";
import { getRoomId, releaseRoom } from "./utils";
import { RoomManager } from "./roomManager";


const MAX_PLAYERS_IN_ROOM = 4;
const app = express();
app.use(jsonBodyParser())
app.use(urlencoded({ extended: true }))
app.set("port", process.env.PORT || 3000);
const httpServer = createServer(app);
const io = new Server(httpServer);

const roomManager = new RoomManager(MAX_PLAYERS_IN_ROOM);
const privateRoomManager = new RoomManager(MAX_PLAYERS_IN_ROOM, true);


app.post("/join_room", (req: express.Request, res: express.Response) => {
  const socketId: string = req.body.socket_ids;
  const room = roomManager.addMembersToAvailableRoom([socketId])
  io.sockets.sockets.get(socketId).join(room.id);
  return res.json({ roomId: room.id })
});


app.post("/private_room", (req: express.Request, res: express.Response) => {
  const socketId = req.body.socket_id;
  const room = privateRoomManager.addMembersToAvailableRoom([socketId])
  io.sockets.sockets.get(socketId).join(room.id);
  return res.json({ roomId: room.id });
});

app.post("/private_room/:id", (req: express.Request, res: express.Response) => {
  const socketId = req.body.socket_id;
  const roomId = req.params.id
  // TODO: Catch specific exceptions here to client knows if room is full/not found
  privateRoomManager.addMemberToRoom(socketId, roomId);
  io.sockets.sockets.get(socketId).join(roomId);
  return res.status(200);
});


app.post("/private_room/:id/public", (req: express.Request, res: express.Response) => {
  const privateRoomId = req.params.id;
  const privateRoomMembers = privateRoomManager.getMembers(privateRoomId);
  const joinedRoom = roomManager.addMembersToAvailableRoom(privateRoomMembers);
  privateRoomMembers.forEach(member => io.sockets.sockets.get(member).join(joinedRoom.id));
  privateRoomManager.removeMembersFromRoom(privateRoomMembers, privateRoomId);
  privateRoomMembers.forEach(member => io.sockets.sockets.get(member).leave(privateRoomId));
  return res.json({ roomId: joinedRoom.id })
});

io.on("connection", function (socket: Socket) {
  const socketId = socket.id;
  socket.on('disconnect', () => {
    roomManager.removeMemberFromAllRooms(socketId);
    privateRoomManager.removeMemberFromAllRooms(socketId);
  });
});

httpServer.listen(3000, function () {
  console.log("listening on *:3000");
});