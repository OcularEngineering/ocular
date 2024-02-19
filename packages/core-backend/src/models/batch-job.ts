import {
  AfterLoad,
  BeforeInsert,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
} from "typeorm"
import {
  BatchJobResultError,
  BatchJobResultStatDescriptor,
  BatchJobStatus,
} from "../types/batch-job"
import { DbAwareColumn, resolveDbType } from "@ocular-ai/utils"

import { SoftDeletableEntity } from "@ocular-ai/types"
import { User } from "./user"
import { generateEntityId } from "../utils/generate-entity-id"

@Entity()
export class BatchJob extends SoftDeletableEntity {
  @DbAwareColumn({ type: "text" })
  type: string

  @Column({ nullable: true })
  created_by: string | null

  @ManyToOne(() => User)
  @JoinColumn({ name: "created_by" })
  created_by_user: User

  @DbAwareColumn({ type: "jsonb", nullable: true })
  context: Record<string, unknown>

  @DbAwareColumn({ type: "jsonb", nullable: true })
  result: {
    count?: number
    advancement_count?: number
    progress?: number
    errors?: (BatchJobResultError | string)[]
    stat_descriptors?: BatchJobResultStatDescriptor[]
    file_key?: string
    file_size?: number
  } & Record<string, unknown>

  @Column({ type: "boolean", nullable: false, default: false })
  dry_run = false

  @Column({ type: resolveDbType("timestamptz"), nullable: true })
  pre_processed_at?: Date

  @Column({ type: resolveDbType("timestamptz"), nullable: true })
  processing_at?: Date

  @Column({ type: resolveDbType("timestamptz"), nullable: true })
  confirmed_at?: Date

  @Column({ type: resolveDbType("timestamptz"), nullable: true })
  completed_at?: Date

  @Column({ type: resolveDbType("timestamptz"), nullable: true })
  canceled_at?: Date

  @Column({ type: resolveDbType("timestamptz"), nullable: true })
  failed_at?: Date

  status: BatchJobStatus

  /**
   * @apiIgnore
   */
  @AfterLoad()
  loadStatus(): void {
    /* Always keep the status order consistent. */
    if (this.pre_processed_at) {
      this.status = BatchJobStatus.PRE_PROCESSED
    }
    if (this.confirmed_at) {
      this.status = BatchJobStatus.CONFIRMED
    }
    if (this.processing_at) {
      this.status = BatchJobStatus.PROCESSING
    }
    if (this.completed_at) {
      this.status = BatchJobStatus.COMPLETED
    }
    if (this.canceled_at) {
      this.status = BatchJobStatus.CANCELED
    }
    if (this.failed_at) {
      this.status = BatchJobStatus.FAILED
    }

    this.status = this.status ?? BatchJobStatus.CREATED
  }

  /**
   * @apiIgnore
   */
  @BeforeInsert()
  private beforeInsert(): void {
    this.id = generateEntityId(this.id, "batch")
  }

  toJSON() {
    this.loadStatus()
    return this
  }
}