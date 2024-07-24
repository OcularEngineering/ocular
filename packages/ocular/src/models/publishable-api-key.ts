import { BeforeInsert, Column, Entity } from "typeorm"

import { BaseEntity } from "@ocular/types"
import { generateEntityId } from "../utils/generate-entity-id"
import { resolveDbType } from "@ocular/utils"

@Entity()
export class PublishableApiKey extends BaseEntity {
  @Column({ type: "varchar", nullable: true })
  created_by: string | null

  @Column({ type: "varchar", nullable: true })
  revoked_by: string | null

  @Column({ type: resolveDbType("timestamptz"), nullable: true })
  revoked_at?: Date

  @Column()
  title: string

  @BeforeInsert()
  private beforeInsert(): void {
    this.id = generateEntityId(this.id, "pk")
  }
}

/**
 * @schema PublishableApiKey
 * title: "Publishable API key"
 * description: "Publishable API key defines scopes (i.e. resources) that are available within a request."
 * type: object
 * required:
 *   - created_at
 *   - created_by
 *   - id
 *   - revoked_by
 *   - revoked_at
 *   - title
 *   - updated_at
 * properties:
 *   id:
 *     description: The key's ID
 *     type: string
 *     example: pk_01G1G5V27GYX4QXNARRQCW1N8T
 *   created_by:
 *    description: The unique identifier of the user that created the key.
 *    nullable: true
 *    type: string
 *    example: usr_01G1G5V26F5TB3GPAPNJ8X1S3V
 *   revoked_by:
 *     description: The unique identifier of the user that revoked the key.
 *     nullable: true
 *     type: string
 *     example: usr_01G1G5V26F5TB3GPAPNJ8X1S3V
 *   revoked_at:
 *     description: The date with timezone at which the key was revoked.
 *     nullable: true
 *     type: string
 *     format: date-time
 *   title:
 *     description: The key's title.
 *     type: string
 *   created_at:
 *     description: The date with timezone at which the resource was created.
 *     type: string
 *     format: date-time
 *   updated_at:
 *     description: The date with timezone at which the resource was updated.
 *     type: string
 *     format: date-time
 */