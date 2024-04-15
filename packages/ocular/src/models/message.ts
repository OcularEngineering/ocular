import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  BeforeInsert,
} from 'typeorm';
import { User } from './user';
import { Chat } from './chat'
import { BaseEntity } from '@ocular/types';
import { DbAwareColumn } from "../../../utils/src/db-aware-column";
import { generateEntityId } from "../utils/generate-entity-id"

export enum MessageRoles {
  ASSISTANT = "assistant",
  USER = "user",
}

@Entity()
export class Message extends BaseEntity {
  @DbAwareColumn({
    type: "enum",
    enum: MessageRoles,
    nullable: false,
  })
  role: MessageRoles

  @Column({type: "varchar", nullable: false})
  content: string;

  @Column({type: "varchar", nullable: false})
  chat_id: string;

  @ManyToOne(() => Chat, chat => chat.messages)
  @JoinColumn({ name: 'chat_id', referencedColumnName: 'id' })
  chat: Chat;

  @Column({type: "varchar", nullable: false})
  user_id: string;

/**
 * @apiIgnore
 */
  @BeforeInsert()
  private beforeInsert(): void {
    this.id = generateEntityId(this.id, "msg")
  }
}