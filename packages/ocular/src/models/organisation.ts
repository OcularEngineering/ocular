import {
  BeforeInsert,
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany
} from "typeorm"
import { BaseEntity, InstalledApp } from "@ocular/types"
import { DbAwareColumn } from "../../../utils/src/db-aware-column"
import { generateEntityId } from "../utils/generate-entity-id"
import { User } from "./user";
import { OAuth } from "./oauth";
import { Event } from "./event";

@Entity()
export class Organisation extends BaseEntity {
  @Column({ default: "Org", type: "varchar" })
  name: string

  @Column({ type: 'json', nullable: true })
  installed_apps: InstalledApp[];

  @OneToMany(() => User, (user) => user?.organisation)
  members?: User[];

  @OneToMany(() => OAuth, oauth => oauth?.organisation)
  oauth?: OAuth[];

  @OneToMany(() => Event, event => event?.organisation)
  events?: Event[];

  @Column({ nullable: true, type: "text" })
  invite_link_template?: string | null

  @DbAwareColumn({ type: "jsonb", nullable: true })
  metadata: Record<string, unknown> | null

  addApp(app: InstalledApp) {
    if (!this.installed_apps) {
      this.installed_apps = [];
    }
    if (!this.installed_apps.some(existingApp => existingApp.id === app.id)) {
      const { id ,name } = app;
      this.installed_apps.push({ id, name });
    }
  }

  /**
   * @apiIgnore
   */
  @BeforeInsert()
  private beforeInsert(): void {
    this.id = generateEntityId(this.id, "org")
  }
}
