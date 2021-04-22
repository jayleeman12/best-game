const availableRooms = [...Array(9000).keys()].map(x => x + 1000);

// TODO: Should not be a module, should be a stateful entity
export function getRoomId() {
    const chosenRoomIndex = Math.floor(Math.random() * availableRooms.length);
    const roomId = availableRooms[chosenRoomIndex];
    availableRooms.splice(chosenRoomIndex, 1);
    return roomId;
}

export function releaseRoom(roomId: number)  {
    availableRooms.push(roomId);
}