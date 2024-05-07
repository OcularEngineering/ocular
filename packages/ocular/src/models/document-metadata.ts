import {
  BeforeInsert,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  UpdateDateColumn,
  CreateDateColumn,
  PrimaryColumn
} from 'typeorm';
import { AppNameDefinitions, DocType } from "@ocular/types"
import { Organisation } from './organisation';
import { DbAwareColumn, resolveDbType } from '@ocular/utils';

@Entity()
export class DocumentMetadata {
  @PrimaryColumn()
  id: string;

  @Column({type: "varchar", nullable: false, unique: true})
  link: string;

  @Column({type: "varchar", nullable: false})
  title: string;

  @DbAwareColumn({
    type: "enum",
    enum: DocType,
    nullable: false,
  })
  type: DocType

  @DbAwareColumn({
    type: "enum",
    enum: AppNameDefinitions,
    nullable: false,
  })
  source: AppNameDefinitions

  @Column({type: "varchar", nullable: false})
  organisation_id: string;

  @CreateDateColumn({ type: resolveDbType("timestamptz") })
  created_at: Date

  // Note: This is manually updated whenever we index or reindex a document.
  @Column({ type: resolveDbType("timestamptz"), nullable: false})
  updated_at: Date
}