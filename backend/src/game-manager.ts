import { Room } from './room';
import { ROOM_TTL_MS } from './types';

export class GameManager {
  private rooms: Map<string, Room> = new Map();

  createRoom(): string {
    const roomId = this.generateRoomCode();
    const room = new Room(roomId);
    this.rooms.set(roomId, room);
    
    console.log(`Room created: ${roomId}`);
    return roomId;
  }

  getRoom(roomId: string): Room | undefined {
    return this.rooms.get(roomId);
  }

  deleteRoom(roomId: string): void {
    this.rooms.delete(roomId);
    console.log(`Room deleted: ${roomId}`);
  }

  cleanup(): void {
    const now = Date.now();
    for (const [roomId, room] of this.rooms.entries()) {
      const allDisconnected = room.data.players.every(p => !p.connected);
      const isExpired = now - room.data.createdAt > ROOM_TTL_MS;
      
      if (allDisconnected || isExpired) {
        this.deleteRoom(roomId);
      }
    }
  }

  private generateRoomCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    if (this.rooms.has(code)) {
      return this.generateRoomCode();
    }
    
    return code;
  }

  getRoomCount(): number {
    return this.rooms.size;
  }
}
