import { BeforeInsert, Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne } from "typeorm"
import { DbAwareColumn, resolveDbType } from "../../../utils/src/db-aware-column"

import { SoftDeletableEntity } from "@ocular-ai/types"
import { UserRoles } from "./user"
import { generateEntityId } from "../utils/generate-entity-id"
import { Organisation } from "./organisation"

@Entity()
export class Invite extends SoftDeletableEntity {
  @Index({ unique: true, where: "deleted_at IS NULL" })
  @Column()
  user_email: string

  @DbAwareColumn({
    type: "enum",
    enum: UserRoles,
    nullable: true,
    enumName: 'UserRoles',
  })
  role: UserRoles

  @Column({ default: false })
  accepted: boolean

  @Column()
  token: string

  @Index("InviteOrganisationId")
  @Column({ type: "varchar", nullable: true })
  organisation_id?: string;

  @ManyToOne(() => Organisation, (organisation) => organisation.invites)
  @JoinColumn({ name: 'organisation_id', referencedColumnName: 'id' })
  organisation?: Organisation;

  @CreateDateColumn({ type: resolveDbType("timestamptz") })
  expires_at: Date

  @DbAwareColumn({ type: "jsonb", nullable: true })
  metadata: Record<string, unknown>

  /**
   * @apiIgnore
   */
  @BeforeInsert()
  private beforeInsert(): void {
    this.id = generateEntityId(this.id, "invite")
  }
}

/**
 * @schema Invite
 * title: "Invite"
 * description: "An invite is created when an admin user invites a new user to join the store's team. Once the invite is accepted, it's deleted."
 * type: object
 * required:
 *   - accepted
 *   - created_at
 *   - deleted_at
 *   - expires_at
 *   - id
 *   - metadata
 *   - role
 *   - token
 *   - updated_at
 *   - user_email
 * properties:
 *   id:
 *     type: string
 *     description: The invite's ID
 *     example: invite_01G8TKE4XYCTHSCK2GDEP47RE1
 *   user_email:
 *     description: The email of the user being invited.
 *     type: string
 *     format: email
 *   role:
 *     description: The user's role. These roles don't change the privileges of the user.
 *     nullable: true
 *     type: string
 *     enum:
 *       - admin
 *       - member
 *       - developer
 *     default: member
 *   accepted:
 *     description: Whether the invite was accepted or not.
 *     type: boolean
 *     default: false
 *   token:
 *     description: The token used to accept the invite.
 *     type: string
 *   expires_at:
 *     description: The date the invite expires at.
 *     type: string
 *     format: date-time
 *   created_at:
 *     description: The date with timezone at which the resource was created.
 *     type: string
 *     format: date-time
 *   updated_at:
 *     description: The date with timezone at which the resource was updated.
 *     type: string
 *     format: date-time
 *   deleted_at:
 *     description: The date with timezone at which the resource was deleted.
 *     nullable: true
 *     type: string
 *     format: date-time
 *   metadata:
 *     description: An optional key-value map with additional details
 *     nullable: true
 *     type: object
 *     example: {car: "white"}
 */