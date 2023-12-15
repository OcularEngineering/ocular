import { Column, Entity, Index, JoinColumn, ManyToOne, BeforeInsert } from "typeorm"
import { Organisation } from "./organisation";
import { BaseEntity } from "../interfaces/models/base-entity";
import { DbAwareColumn } from "../utils/db-aware-column";
import { generateEntityId } from "../utils/generate-entity-id";

/**
 * @enum
 * 
 * The user's role.
 */
export enum UserRoles {
  /**
   * The user is an admin.
   */
  ADMIN = "admin",
  /**
   * The user is a team member.
   */
  MEMBER = "member",
}

@Entity()
export class User extends BaseEntity {
  @DbAwareColumn({
    type: "enum",
    enum: UserRoles,
    nullable: true,
    default: UserRoles.MEMBER,
  })
  role: UserRoles

  @Index({ unique: true, where: "deleted_at IS NULL" })
  @Column()
  email: string

  @Column({ nullable: true })
  first_name: string

  @Column({ nullable: true })
  last_name: string

  @DbAwareColumn({ type: "jsonb", nullable: true })
  metadata: Record<string, unknown>

  @Index("UserOrganisationId")
  @Column({ nullable: true })
  organisation_id?: string;

  @ManyToOne(() => Organisation, (organisation) => organisation.members)
  @JoinColumn({ name: 'organisation_id', referencedColumnName: 'id' })
  organisation?: Organisation;

  /**
  * @apiIgnore
  */
  @BeforeInsert()
  private beforeInsert(): void {
    this.id = generateEntityId(this.id, "usr")
  }
}