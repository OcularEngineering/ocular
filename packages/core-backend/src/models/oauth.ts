import { BeforeInsert, Column, Entity, JoinColumn, ManyToOne} from "typeorm"
import { DbAwareColumn } from "../../../utils/src/db-aware-column"
import { generateEntityId } from "../utils/generate-entity-id"
import { Organisation } from "./organisation"
import { BaseEntity } from "@ocular-ai/types"
import { App } from "./app"


@Entity()
export class OAuth extends BaseEntity {

  @DbAwareColumn({ type: "jsonb", nullable: true })
  data: Record<string, unknown>

  @Column({ type: "varchar", nullable: true })
  app_id: string;

  @ManyToOne(() => App, (app) => app.oauths)
  @JoinColumn({ name: 'app_id', referencedColumnName: 'id' })
  app: App;

  @Column({ type: "varchar", nullable: true })
  organisation_id: string;

  @ManyToOne(() => Organisation, (organisation) => organisation.members)
  @JoinColumn({ name: 'organisation_id', referencedColumnName: 'id' })
  organisation: Organisation;

  /**
   * @apiIgnore
   */
  @BeforeInsert()
  private beforeInsert(): void {
    this.id = generateEntityId(this.id, "oauth")
  }
}