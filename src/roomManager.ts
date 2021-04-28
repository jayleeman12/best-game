import { v4 as uuidv4 } from 'uuid';

export type Room = {
    members: string[];
    id: string;
}

export class RoomManager {
    private rooms: Room[] = []
    private availableRoomIds: string[]
    constructor(
        private readonly maxPlayersInRoom: number,
        private readonly humanRoomIds: boolean = false) {

        this.availableRoomIds = [...Array(8998).keys()].map(x => (x + 1000).toString())
    }

    public addMembersToAvailableRoom(memberIds: string[]): Room {
        for (let i = 0; i < this.rooms.length; i++) {
            const room = this.rooms[i]
            if (room.members.length < this.maxPlayersInRoom - memberIds.length + 1) {
                room.members.push(...memberIds)
                return room
            }
        }
        const newRoom = {
            id: this.getAvailableRoomId(),
            members: memberIds
        }
        return newRoom;
    }

    public addMemberToRoom(memberId: string, roomId: string) {
        const room = this.rooms.find(room => room.id === roomId)
        if (!room) {
            throw new Error(`Room not found: roomId: ${roomId}`)
        }
        if (room.members.length >= this.maxPlayersInRoom) {
            throw new Error(`Room already full: roomId: ${roomId}`)
        }
        room.members.push(memberId);
    }

    public removeMembersFromRoom(memberIds: string[], roomId: string) {
        const room = this.rooms.find(room => room.id === roomId);
        const membersIndicies: number[] = room.members.filter(member => memberIds.includes(member)).map(i => parseInt(i)).sort();
        for (let i = membersIndicies.length -1; i >= 0; i--) {
            room.members.splice(membersIndicies[i] ,1);
        }
        if (room.members.length === 0) {
            if (this.humanRoomIds) {
                this.availableRoomIds.push(room.id);
            }
            this.rooms.splice(this.rooms.findIndex(room => room.id === roomId));
        }
    }

    public getMembers(roomId: string): string[] {
        return this.rooms.find(room => room.id === roomId).members
    }

    public removeMemberFromAllRooms(memberId: string) {
        this.rooms.forEach(room => {
            const memberIndex = room.members.findIndex(member => member === memberId);
            if (memberIndex !== -1) {
                room.members.splice(memberIndex, 1);
            }
        })
    }

    private getAvailableRoomId(): string {
        if (this.humanRoomIds) {
            const chosenRoomIndex = Math.floor(Math.random() * this.availableRoomIds.length);
            const roomId = this.availableRoomIds[chosenRoomIndex];
            this.availableRoomIds.splice(chosenRoomIndex, 1);
            return roomId;
        } else {
            return uuidv4();
        }
    }
}