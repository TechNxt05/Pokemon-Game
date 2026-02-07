import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Pokemon {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column('simple-array')
  types: string[];

  @Column('jsonb')
  baseStats: {
    hp: number;
    atk: number;
    def: number;
    spa: number;
    spd: number;
    spe: number;
  };

  @Column('simple-array', { nullable: true })
  moves: string[];

  @Column({ nullable: true })
  frontSpriteUrl: string;

  @Column({ nullable: true })
  backSpriteUrl: string;
}
