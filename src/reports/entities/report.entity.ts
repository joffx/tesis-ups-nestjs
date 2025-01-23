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

  @Column('float', { default: 0.0 })
  precision: number;

  @Column()
  object: string;

  @Column('float', { default: 0.0 })
  uploadTime: number;

  @CreateDateColumn()
  createdAt: Date;
}
