import { Module } from '@nestjs/common';
import { MovesService } from './moves.service';
import { MovesController } from './moves.controller';

@Module({
  controllers: [MovesController],
  providers: [MovesService],
})
export class MovesModule {}
