import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Move {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column()
  type: string;

  @Column()
  power: number;

  @Column()
  accuracy: number;

  @Column()
  energyCost: number;

  @Column()
  cooldown: number; // in seconds

  @Column()
  executionTime: number; // in seconds
}
