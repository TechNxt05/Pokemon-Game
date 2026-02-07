import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  clerkId: string;

  @Column({ default: 1000 })
  elo: number;

  @CreateDateColumn()
  createdAt: Date;
}
