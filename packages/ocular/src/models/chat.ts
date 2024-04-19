import {
  BeforeInsert,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany
} from 'typeorm';
import { BaseEntity} from "@ocular/types"
import { User } from './user';
import { Message } from './message'
import { generateEntityId } from "../utils/generate-entity-id"
import { Organisation } from './organisation';

@Entity()
export class Chat extends BaseEntity {
  @Column({type: "varchar", nullable: false})
  name: string;

  @OneToMany(() => Message, messages => messages?.chat)
  messages?: Message[];

  @Column({type: "varchar", nullable: false})
  user_id: string;

  @Column({type: "varchar", nullable: false})
  organisation_id: string;

/**
 * @apiIgnore
 */
  @BeforeInsert()
  private beforeInsert(): void {
    this.id = generateEntityId(this.id, "chat")
  }
}