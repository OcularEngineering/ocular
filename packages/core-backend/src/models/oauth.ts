import { BeforeInsert, Column, Entity, JoinColumn, ManyToOne, OneToMany} from "typeorm"
import { DbAwareColumn } from "../../../utils/src/db-aware-column"
import { generateEntityId } from "../utils/generate-entity-id"
import { Organisation } from "./organisation"
import { BaseEntity } from "@ocular-ai/types"
import { App } from "./app"
import { Event } from "./event"


@Entity()
export class OAuth extends BaseEntity {

  @DbAwareColumn({ type: "jsonb", nullable: true })
  data: Record<string, unknown>

  @Column({ type: "varchar", nullable: false })
  app_id: string;


  @Column({ type: "varchar", nullable: true })
  organisation_id: string;

  @ManyToOne(() => Organisation, (organisation) => organisation.members)
  @JoinColumn({ name: 'organisation_id', referencedColumnName: 'id' })
  organisation: Organisation;

  @OneToMany(() => Event, (event) => event?.oauth)
  events?: Event[];

  /**
   * @apiIgnore
   */
  @BeforeInsert()
  private beforeInsert(): void {
    this.id = generateEntityId(this.id, "oauth")
  }
}