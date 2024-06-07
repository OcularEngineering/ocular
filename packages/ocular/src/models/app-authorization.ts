import {
  CreateDateColumn,
  BeforeInsert,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { DbAwareColumn } from "../../../utils/src/db-aware-column";
import { generateEntityId } from "../utils/generate-entity-id";
import { Organisation } from "./organisation";
import { AppNameDefinitions, BaseEntity, AuthStrategy } from "@ocular/types";
import { resolveDbType } from "@ocular/utils";
import { App } from "./app";
import { Event } from "./event";
import { type } from "os";

@Entity()
export class AppAuthorization extends BaseEntity {
  @Index("AuthorizationAppName")
  @DbAwareColumn({
    type: "enum",
    enum: AppNameDefinitions,
    nullable: false,
    unique: false,
  })
  app_name: AppNameDefinitions;

  @DbAwareColumn({
    type: "enum",
    enum: AuthStrategy,
    nullable: false,
    unique: false,
  })
  auth_strategy: AuthStrategy;

  @Column({ type: "varchar", nullable: false })
  type: string;

  @Column({ type: "varchar", nullable: false })
  token: string;

  @CreateDateColumn({ type: resolveDbType("timestamptz") })
  token_expires_at: Date;

  @Column({ type: "varchar", nullable: false })
  refresh_token: string;

  @CreateDateColumn({ type: resolveDbType("timestamptz") })
  refresh_token_expires_at: Date;

  @Column({ type: "timestamptz", nullable: true, default: () => "NULL" })
  last_sync: Date;

  @Column({ type: "varchar", nullable: true })
  organisation_id: string;

  @DbAwareColumn({ type: "jsonb", nullable: true })
  metadata?: Record<string, unknown> | null;

  @ManyToOne(() => Organisation, (organisation) => organisation.members)
  @JoinColumn({ name: "organisation_id", referencedColumnName: "id" })
  organisation: Organisation;

  @OneToMany(() => Event, (event) => event?.app_authorization)
  events?: Event[];

  /**
   * @apiIgnore
   */
  @BeforeInsert()
  private beforeInsert(): void {
    this.id = generateEntityId(this.id, "app_authorization");
  }
}
