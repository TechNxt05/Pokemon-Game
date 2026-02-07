import { Injectable } from '@nestjs/common';

export interface LobbyPlayer {
  userId: string;
  socketId: string;
  ready: boolean;
  team: any[]; // Selected Pokemon
}

export interface LobbyState {
  roomId: string; // 6-char code
  hostId: string;
  players: LobbyPlayer[];
  status: 'waiting' | 'selecting' | 'battling';
}

@Injectable()
export class LobbyService {
  private lobbies = new Map<string, LobbyState>();

  createLobby(hostUserId: string, hostSocketId: string): LobbyState {
    const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    const lobby: LobbyState = {
      roomId,
      hostId: hostUserId,
      players: [
        { userId: hostUserId, socketId: hostSocketId, ready: false, team: [] },
      ],
      status: 'waiting',
    };
    this.lobbies.set(roomId, lobby);
    return lobby;
  }

  joinLobby(roomId: string, userId: string, socketId: string): LobbyState {
    const lobby = this.lobbies.get(roomId);
    if (!lobby) throw new Error('Lobby not found');
    if (lobby.status !== 'waiting') throw new Error('Lobby is busy');
    if (lobby.players.some((p) => p.userId === userId)) return lobby; // Re-join
    if (lobby.players.length >= 2) throw new Error('Lobby is full');

    lobby.players.push({ userId, socketId, ready: false, team: [] });
    return lobby;
  }

  getLobby(roomId: string) {
    return this.lobbies.get(roomId);
  }

  // Additional methods for Team Selection...
}
