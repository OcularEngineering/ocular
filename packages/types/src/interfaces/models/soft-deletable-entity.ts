import { BaseEntity } from "./base-entity"
import { DeleteDateColumn } from "typeorm"
import { resolveDbType } from "@ocular-ai/utils"

export abstract class SoftDeletableEntity extends BaseEntity {
  @DeleteDateColumn({ type: resolveDbType("timestamptz") })
  deleted_at: Date | null
}