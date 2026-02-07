import { Injectable } from '@nestjs/common';
import { BattleState } from './battle-state.interface';

@Injectable()
export class BattleStoreService {
  private battles: Map<string, BattleState> = new Map();

  save(state: BattleState) {
    this.battles.set(state.matchId, state);
  }

  get(matchId: string): BattleState | undefined {
    return this.battles.get(matchId);
  }

  getAll(): BattleState[] {
    return Array.from(this.battles.values());
  }

  delete(matchId: string) {
    this.battles.delete(matchId);
  }
}
