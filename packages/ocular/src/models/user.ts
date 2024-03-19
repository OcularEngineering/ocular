import { Column, Entity, Index, JoinColumn, ManyToOne, BeforeInsert, JoinTable, ManyToMany } from "typeorm"
import { Organisation } from "./organisation";
import { BaseEntity, UserRoles  } from "@ocular/types";
import { DbAwareColumn } from "../../../utils/src/db-aware-column";
import { generateEntityId } from "../utils/generate-entity-id";
import { Team } from "./team";
@Entity()
export class User extends BaseEntity {
  @DbAwareColumn({
    type: "enum",
    enum: UserRoles,
    nullable: true,
    default: UserRoles.MEMBER,
  })
  role: UserRoles

  @Index({ unique: true })
  @Column({ type: "varchar" })
  email: string

  @Column({ type: "varchar",nullable: true })
  first_name: string

  @Column({ type: "varchar", nullable: true })
  last_name: string

    /**
   * @apiIgnore
   */
    @Column({ nullable: true, select: false })
    password_hash: string

  @DbAwareColumn({ type: "jsonb", nullable: true })
  metadata: Record<string, unknown>

  @Index("UserOrganisationId")
  @Column({ type: "varchar", nullable: true })
  organisation_id?: string;

  @ManyToOne(() => Organisation, (organisation) => organisation.members)
  @JoinColumn({ name: 'organisation_id', referencedColumnName: 'id' })
  organisation?: Organisation;

  @JoinTable({
    name: "team_members",
    joinColumn: {
      name: "team_id",
      referencedColumnName: "id",
    },
    inverseJoinColumn: {
      name: "user_id",
      referencedColumnName: "id",
    },
  })
  @ManyToMany(() => Team, (team) => team.members,{
    onDelete: "CASCADE"
  })
  teams: Team[];

  /**
  * @apiIgnore
  */
  @BeforeInsert()
  private beforeInsert(): void {
    this.id = generateEntityId(this.id, "usr")
  }
}