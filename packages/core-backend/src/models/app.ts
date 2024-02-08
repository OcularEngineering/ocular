import { BeforeInsert, Column, Entity, Index, OneToMany} from "typeorm"
import { generateEntityId } from "../utils/generate-entity-id"
import { BaseEntity } from "@ocular-ai/types"
import { OAuth } from "./oauth"


@Entity()
export class App extends BaseEntity {
  
  @Index({ unique: true })
  @Column()
  name: string

  @Column({ nullable: true })
  install_url: string

  @Column({ nullable: true })
  uninstall_url: string

  @OneToMany(() => OAuth, oauth => oauth?.app)
  oauths?: OAuth[];

  /**
   * @apiIgnore
   */
  @BeforeInsert()
  private beforeInsert(): void {
    this.id = generateEntityId(this.id, "app")
  }
}