import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { BattleService } from './battle.service';
import { BattleStoreService } from './battle-store.service';
import type { BattleActionPayload } from './battle-state.interface';

import { LobbyService } from '../lobby/lobby.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class BattleGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly battleService: BattleService,
    private readonly battleStore: BattleStoreService,
    private readonly lobbyService: LobbyService,
  ) { }

  afterInit() {
    setInterval(() => {
      const allStates = this.battleStore.getAll();
      allStates.forEach(state => {
        const result = this.battleService.checkTimeout(state);
        if (result.timeout) {
          this.battleStore.save(state);
          this.server.to(state.matchId).emit('MATCH_STATE', state);
        }
      });
    }, 1000);
  }

  handleConnection(client: Socket) { }
  handleDisconnect(client: Socket) { }

  @SubscribeMessage('CREATE_LOBBY')
  handleCreateLobby(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { userId: string },
  ) {
    const lobby = this.lobbyService.createLobby(payload.userId, client.id);
    client.join(lobby.roomId);
    client.emit('LOBBY_STATE', lobby);
  }

  @SubscribeMessage('JOIN_LOBBY')
  handleJoinLobby(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { roomId: string; userId: string },
  ) {
    try {
      const lobby = this.lobbyService.joinLobby(
        payload.roomId,
        payload.userId,
        client.id,
      );
      client.join(lobby.roomId);
      this.server.to(lobby.roomId).emit('LOBBY_STATE', lobby);
    } catch (e) {
      client.emit('LOBBY_ERROR', { message: e.message });
    }
  }

  @SubscribeMessage('START_GAME')
  handleStartGame(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { roomId: string; userId: string },
  ) {
    const lobby = this.lobbyService.getLobby(payload.roomId);
    if (!lobby || lobby.hostId !== payload.userId) return;

    if (lobby.players.length < 2) {
      // For MVP allow 1 player to play vs CPU if we want, or enforce 2.
      // Enforce 2 for "Competitive" feel logic
      // client.emit('LOBBY_ERROR', { message: 'Need 2 players' });
      // actually let's allow 1 player for dev testing
    }

    // Initialize Battle
    const p1 = {
      userId: lobby.players[0].userId,
      team: this.battleService.generateMockTeam(), // Todo: Use selected team
      activePokemonId: 'mon_1',
      sideConditions: [],
    };
    const p2 = {
      userId: lobby.players[1]?.userId || 'cpu',
      team: this.battleService.generateMockTeam(),
      activePokemonId: 'mon_1',
      sideConditions: [],
    };

    const state = this.battleService.createBattle(
      lobby.roomId,
      p1,
      p2,
      lobby.roomId,
    );
    this.battleStore.save(state);

    lobby.status = 'battling';
    this.server
      .to(lobby.roomId)
      .emit('GAME_STARTED', { matchId: lobby.roomId });
  }

  @SubscribeMessage('JOIN_MATCH')
  handleJoinMatch(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: { matchId: string; userId: string; username: string },
  ) {
    const { matchId, userId, username } = payload;
    client.join(matchId);

    let state = this.battleStore.get(matchId);
    if (!state) {
      // Logic for fallback test-matches (Direct URL Join)
      const p1 = {
        userId,
        team: this.battleService.generateMockTeam(),
        activePokemonId: 'mon_1',
        sideConditions: [],
      };
      // Placeholder P2 (used for initialization)
      const p2 = {
        userId: 'placeholder',
        team: [],
        activePokemonId: '',
        sideConditions: [],
      };

      state = this.battleService.createBattle(matchId, p1, p2, matchId);
      // Manually ensuring phase and player list
      state.phase = 'waiting_for_players';
      state.playerIds = [userId]; // Only P1 is real
      delete state.players['placeholder']; // Remove placeholder from map if needed, or keep for structure

      this.battleStore.save(state);
    } else {
      // Add Player 2 if not already in match
      if (!state.playerIds.includes(userId)) {
        if (state.playerIds.length < 2) {
          state.playerIds.push(userId);
          state.players[userId] = {
            userId,
            team: this.battleService.generateMockTeam(), // Todo: Empty for draft?
            activePokemonId: 'mon_1',
            sideConditions: [],
          };
          this.battleStore.save(state);
        }
      }
    }

    this.server.to(matchId).emit('USER_JOINED', { userId, username });
    this.server.to(matchId).emit('MATCH_STATE', state); // Broadcast updated state to room
    return { event: 'JOINED', data: { matchId, role: 'player' } };
  }

  @SubscribeMessage('START_MATCH')
  handleStartMatch(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { matchId: string, userId: string }
  ) {
    const state = this.battleStore.get(payload.matchId);
    if (!state) return;

    // Verify Host (First player in list is host)
    if (state.playerIds[0] !== payload.userId) return;

    if (state.playerIds.length < 2) {
      // Allow start with CPU if CPU enabled, else error
      // For now, assume if 2 players are there, or P2 is CPU.
      // Check CPU logic or block if solo?
      // Since user wants wait room, likely Pvp.
    }

    this.battleService.startReveal(state);
    this.battleStore.save(state);
    this.server.to(payload.matchId).emit('MATCH_STATE', state);
  }

  @SubscribeMessage('SELECT_ACTION')
  handleSelectAction(
    @ConnectedSocket() _client: Socket,
    @MessageBody() payload: BattleActionPayload,
  ) {
    const state = this.battleStore.get(payload.matchId);
    if (!state) return;

    if (payload.action.type === 'draft' && payload.action.draftIndex !== undefined) {
      const success = this.battleService.handleDraft(state, payload.userId, payload.action.draftIndex);
      if (success) {
        this.battleStore.save(state);
        this.server.to(payload.matchId).emit('MATCH_STATE', state);
      }
      return;
    }

    // Battle Move Logic
    if (state.phase !== 'battle') return;

    // Validate turn
    // ...

    const newState = this.battleService.processTurn(state, payload);
    this.battleStore.save(newState);

    this.server.to(payload.matchId).emit('MATCH_STATE', newState);
  }
}
