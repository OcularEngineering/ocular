import {
  BeforeInsert,
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { BaseEntity } from "@ocular/types";
import { generateEntityId } from "../utils/generate-entity-id";
import { Organisation } from "./organisation";
import { DbAwareColumn } from "../../../utils/src/db-aware-column";
import { AppAuthorization } from "./app-authorization";
import { App } from "./app";

@Entity()
export class Event extends BaseEntity {
  /**
   * The name of the entity.
   */
  @Column({ type: "varchar", nullable: false })
  name: string;

  @Column({ type: "varchar", nullable: true })
  description?: string;

  @Column({ type: "varchar", nullable: true })
  app_authorization_id: string;

  @ManyToOne(() => AppAuthorization, (auth) => auth.events)
  @JoinColumn({ name: "app_authorization_id", referencedColumnName: "id" })
  app_authorization: AppAuthorization;

  @Column({ type: "varchar", nullable: true })
  organisation_id: string;

  @ManyToOne(() => Organisation, (organisation) => organisation.events)
  @JoinColumn({ name: "organisation_id", referencedColumnName: "id" })
  organisation: Organisation;

  @Column({ type: "varchar", nullable: true })
  component_id: string;
  /**
   * @apiIgnore
   */
  @BeforeInsert()
  private beforeInsert(): void {
    this.id = generateEntityId(this.id, "comp");
  }
}
