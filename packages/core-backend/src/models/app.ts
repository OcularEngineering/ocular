import { BeforeInsert, Column, Entity, Index, OneToMany} from "typeorm"
import { generateEntityId } from "../utils/generate-entity-id"
import { BaseEntity, AppNameDefinitions } from "@ocular-ai/types"
import { OAuth } from "./oauth"
import { DbAwareColumn } from "@ocular-ai/utils"


@Entity()
export class App extends BaseEntity {

  @Index("AppName")
  @DbAwareColumn({
    type: "enum",
    enum: AppNameDefinitions,
    nullable: false,
    unique: true
  })
  name: AppNameDefinitions

  @Column({  unique:true, type: "varchar", nullable: false  })
  identifier: string

  @Column({ type: "varchar", nullable: true  })
  state: string

  @Column({ type: "varchar", nullable: true})
  logo: string

  @Column({ type: "varchar", nullable: true })
  description: string

  @Column({ type: "varchar", nullable: true})
  website: string

  @Column({ type: "varchar", nullable: true})
  oauth_url: string

  @Column({ nullable: true,  type: "varchar" })
  install_url: string

  @Column({ type: "varchar", nullable: true})
  uninstall_url: string

  /**
   * @apiIgnore
   */
  @BeforeInsert()
  private beforeInsert(): void {
    this.id = generateEntityId(this.id, "app")
  }
}