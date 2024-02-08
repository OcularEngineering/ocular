// name
// organisation - one to many
// members - many to many
// components - many to many
import { BaseEntity } from "@ocular-ai/types";
import { BeforeInsert, Column, Entity, Index, JoinColumn, JoinTable, ManyToMany, ManyToOne, PrimaryColumn } from "typeorm"
import { Organisation } from "./organisation";
import { User } from "./user";
import { Component } from "./component";
import { generateEntityId } from "../utils/generate-entity-id";

@Entity()
export class Team extends BaseEntity {
  @Column()
  name: string

  @Column({ type: "varchar", nullable: true })
  organisation_id: string;

  @ManyToOne(() => Organisation, (organisation) => organisation.members)
  @JoinColumn({ name: 'organisation_id', referencedColumnName: 'id' },)
  organisation: Organisation;

  @ManyToMany(() => User, (user) => user.teams,{onDelete: "CASCADE"})
  members: User[]

  @ManyToMany(() => Component, (component) => component.teams,{ onDelete: "CASCADE"})
  components: Component[]

    /**
   * @apiIgnore
   */
    @BeforeInsert()
    private beforeInsert(): void {
      this.id = generateEntityId(this.id, "team")
    }
}