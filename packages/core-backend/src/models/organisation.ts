import {
  BeforeInsert,
  Column,
  Entity,
  OneToMany
} from "typeorm"
import { BaseEntity } from "../types/interfaces/models/base-entity"
import { DbAwareColumn } from "../utils/db-aware-column"
import { generateEntityId } from "../utils/generate-entity-id"
import { User } from "./user";
import { Invite } from "./invite";
import { Component, } from "./component";
import { OAuth } from "./oauth";

@Entity()
export class Organisation extends BaseEntity {
  @Column({ default: "Org", type: "varchar" })
  name: string

  @OneToMany(() => User, (user) => user?.organisation)
  members?: User[];

  @OneToMany(() => Invite, invite => invite?.organisation)
  invites?: Invite[];

  @OneToMany(() => Component, component => component?.organisation)
  components?: Component[];

  @OneToMany(() => OAuth, oauth => oauth?.organisation)
  oauth?: OAuth[];

  @Column({ nullable: true, type: "text" })
  invite_link_template?: string | null

  @DbAwareColumn({ type: "jsonb", nullable: true })
  metadata: Record<string, unknown> | null

  /**
   * @apiIgnore
   */
  @BeforeInsert()
  private beforeInsert(): void {
    this.id = generateEntityId(this.id, "org")
  }
}
