import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity()
export class Match {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('jsonb')
  players: any[]; // Store { userId, team }

  @Column({ nullable: true })
  winnerId: string;

  @Column('jsonb', { nullable: true })
  log: any[]; // Store turn-by-turn log

  @Column()
  seed: string;

  @CreateDateColumn()
  playedAt: Date;
}
