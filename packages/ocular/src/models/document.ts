import {
  BeforeInsert,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany
} from 'typeorm';
import { AppNameDefinitions, BaseEntity, DocType } from "@ocular/types"
import { Organisation } from './organisation';
import { DbAwareColumn } from '@ocular/utils';

@Entity()
export class Document extends BaseEntity {
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

  @DbAwareColumn({ type: "jsonb", nullable: true })
  metadata?: Record<string, unknown> | null
}