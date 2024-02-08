import {
  BeforeInsert,
  Column,
  Entity,
  OneToMany
} from "typeorm"
import { BaseEntity } from "@ocular-ai/types"
import { DbAwareColumn } from "../../../utils/src/db-aware-column"
import { generateEntityId } from "../utils/generate-entity-id"
import { User } from "./user";
import { Invite } from "./invite";
import { Component, } from "./component";
import { OAuth } from "./oauth";
import { Team } from "./team";

@Entity()
export class Organisation extends BaseEntity {
  @Column({ default: "Org", type: "varchar" })
  name: string

  @OneToMany(() => User, (user) => user?.organisation)
  members?: User[];

  @OneToMany(() => Team, (team) => team?.organisation)
  teams?: Team[];

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
