// Table designed by Michael Moyo
import {
  BeforeInsert,
  Column,
  Entity,
  Generated,
  Index,
  ManyToMany,
  OneToMany,
} from "typeorm";
import { generateEntityId } from "../utils/generate-entity-id";
import {
  BaseEntity,
  AppNameDefinitions,
  AppCategoryDefinitions,
  AuthStrategy,
} from "@ocular/types";
import { AppAuthorization } from "./oauth";
import { DbAwareColumn } from "@ocular/utils";
import { Organisation } from "./organisation";

@Entity()
export class App extends BaseEntity {
  @Index("AppName")
  @DbAwareColumn({
    type: "enum",
    enum: AppNameDefinitions,
    nullable: false,
    unique: true,
  })
  name: AppNameDefinitions;

  @DbAwareColumn({
    type: "enum",
    enum: AuthStrategy,
    nullable: false,
    unique: false,
  })
  auth_strategy: AuthStrategy;

  @Column({ type: "varchar", nullable: true })
  oauth_url: string;

  @Column({ nullable: true, type: "varchar" })
  install_url: string;

  @Column({ type: "varchar", nullable: true })
  uninstall_url: string;

  @Column({ type: "varchar", nullable: false, unique: true })
  slug: string;

  @DbAwareColumn({
    type: "enum",
    enum: AppCategoryDefinitions,
    nullable: false,
  })
  category: AppCategoryDefinitions;

  @Column({ type: "varchar", nullable: false })
  developer: string;

  @Column({ type: "varchar", nullable: false })
  logo: string;

  @Column({ type: "varchar", nullable: true, array: true, default: [] })
  images: string[];

  @Column({ type: "varchar", nullable: false })
  overview: string;

  @Column({ type: "varchar", nullable: false })
  description: string;

  @Column({ type: "varchar", nullable: false })
  website: string;

  @Column({ type: "varchar", nullable: true })
  docs: string;

  @Column({ type: "tsvector", nullable: false })
  tsv: string;

  /**
   * @apiIgnore
   */
  @BeforeInsert()
  private beforeInsert(): void {
    this.id = generateEntityId(this.id, "app");
    this.generateTsv();
  }

  // Function to generate tsv value based on specified columns
  private generateTsv(): void {
    this.tsv = `setweight(to_tsvector('english', ${this.name}), 'A') || setweight(to_tsvector('english', ${this.description}), 'B') || setweight(to_tsvector('english', ${this.overview}), 'C') || setweight(to_tsvector('english', ${this.category}), 'D') || setweight(to_tsvector('english', ${this.slug}), 'D')`;
  }
}
