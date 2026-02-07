import { Injectable, OnModuleInit } from '@nestjs/common';
import { BattleService } from './battle.service';
import { BattleStoreService } from './battle-store.service';
import { BattleGateway } from './battle.gateway';

@Injectable()
export class GameLoopService implements OnModuleInit {
  constructor(
    private readonly battleService: BattleService,
    private readonly battleStore: BattleStoreService,
    private readonly battleGateway: BattleGateway,
  ) {}

  onModuleInit() {
    setInterval(() => this.tick(), 1000);
  }

  private tick() {
    const battles = this.battleStore.getAll();
    for (const battle of battles) {
      if (battle.phase === 'finished') continue;

      const { timeout, action } = this.battleService.checkTimeout(battle);
      if (timeout) {
        console.log(`Match ${battle.matchId} timed out. Action: ${action}`);
        // Simple auto-turn logic for now
        // In full implementation, this triggers move selection for the idle player

        // For MVP: Force turn transition
        battle.turn++;
        // Reset timers
        battle.timers.currentPhaseExpiry =
          Date.now() + battle.timers.turnDuration;

        this.battleStore.save(battle);
        this.battleGateway.server
          .to(battle.matchId)
          .emit('MATCH_STATE', battle);
      }
    }
  }
}
