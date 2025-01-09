import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
@Entity('reports')
export class Report {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  url: string;

  @Column()
  precision: string;

  @Column()
  object: string;

  @CreateDateColumn()
  createdAt: Date;
}
