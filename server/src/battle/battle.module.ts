import { Module } from '@nestjs/common';
import { BattleService } from './battle.service';
import { BattleGateway } from './battle.gateway';
import { PokemonModule } from '../pokemon/pokemon.module';
import { LobbyService } from '../lobby/lobby.service';
import { BattleStoreService } from './battle-store.service';

@Module({
  imports: [PokemonModule],
  providers: [BattleService, BattleGateway, LobbyService, BattleStoreService],
  exports: [BattleService],
})
export class BattleModule { }
