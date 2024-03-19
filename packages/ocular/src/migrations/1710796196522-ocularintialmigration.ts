import { MigrationInterface, QueryRunner } from "typeorm";

export class Ocularintialmigration1710796196522 implements MigrationInterface {
    name = 'Ocularintialmigration1710796196522'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."invite_role_enum" AS ENUM('admin', 'member')`);
        await queryRunner.query(`CREATE TABLE "invite" ("id" character varying NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "user_email" character varying NOT NULL, "role" "public"."invite_role_enum" DEFAULT 'member', "accepted" boolean NOT NULL DEFAULT false, "token" character varying NOT NULL, "organisation_id" character varying, "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "metadata" jsonb, CONSTRAINT "PK_fc9fa190e5a3c5d80604a4f63e1" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_6b0ce4b4bcfd24491510bf19d1" ON "invite" ("user_email") WHERE deleted_at IS NULL`);
        await queryRunner.query(`CREATE INDEX "InviteOrganisationId" ON "invite" ("organisation_id") `);
        await queryRunner.query(`CREATE TABLE "team" ("id" character varying NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "name" character varying NOT NULL, "organisation_id" character varying, CONSTRAINT "PK_f57d8293406df4af348402e4b74" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."o_auth_app_name_enum" AS ENUM('asana', 'confluence', 'github', 'gmail', 'google-drive', 'jira', 'notion', 'slack')`);
        await queryRunner.query(`CREATE TABLE "o_auth" ("id" character varying NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "app_name" "public"."o_auth_app_name_enum" NOT NULL, "type" character varying NOT NULL, "token" character varying NOT NULL, "token_expires_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "refresh_token" character varying NOT NULL, "refresh_token_expires_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "last_sync" TIMESTAMP WITH TIME ZONE DEFAULT NULL, "organisation_id" character varying, "metadata" jsonb, CONSTRAINT "PK_10172120973beff91c304345fa3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "OAuthAppName" ON "o_auth" ("app_name") `);
        await queryRunner.query(`CREATE TABLE "event" ("id" character varying NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "name" character varying NOT NULL, "description" character varying, "oauth_id" character varying, "organisation_id" character varying, "component_id" character varying, CONSTRAINT "PK_30c2f3bbaf6d34a55f8ae6e4614" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."component_type_enum" AS ENUM('service', 'application', 'ui')`);
        await queryRunner.query(`CREATE TABLE "component" ("id" character varying NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "type" "public"."component_type_enum", "name" character varying NOT NULL, "description" character varying, "organisation_id" character varying, CONSTRAINT "PK_c084eba2d3b157314de79135f09" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "organisation" ("id" character varying NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "name" character varying NOT NULL DEFAULT 'Org', "installed_apps" json, "invite_link_template" text, "metadata" jsonb, CONSTRAINT "PK_c725ae234ef1b74cce43d2d00c1" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."user_role_enum" AS ENUM('admin', 'member')`);
        await queryRunner.query(`CREATE TABLE "user" ("id" character varying NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "role" "public"."user_role_enum" DEFAULT 'member', "email" character varying NOT NULL, "first_name" character varying, "last_name" character varying, "password_hash" character varying, "metadata" jsonb, "organisation_id" character varying, CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_e12875dfb3b1d92d7d7c5377e2" ON "user" ("email") `);
        await queryRunner.query(`CREATE INDEX "UserOrganisationId" ON "user" ("organisation_id") `);
        await queryRunner.query(`CREATE TABLE "staged_job" ("id" character varying NOT NULL, "event_name" character varying NOT NULL, "data" jsonb NOT NULL, "options" jsonb NOT NULL DEFAULT '{}', CONSTRAINT "PK_9a28fb48c46c5509faf43ac8c8d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."app_name_enum" AS ENUM('asana', 'confluence', 'github', 'gmail', 'google-drive', 'jira', 'notion', 'slack')`);
        await queryRunner.query(`CREATE TYPE "public"."app_category_enum" AS ENUM('Software Development', 'File Storage', 'Productivity', 'Documentation', 'Messaging')`);
        await queryRunner.query(`CREATE TABLE "app" ("id" character varying NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "name" "public"."app_name_enum" NOT NULL, "oauth_url" character varying, "install_url" character varying, "uninstall_url" character varying, "slug" character varying NOT NULL, "category" "public"."app_category_enum" NOT NULL, "developer" character varying NOT NULL, "logo" character varying NOT NULL, "images" character varying array DEFAULT '{}', "overview" character varying NOT NULL, "description" character varying NOT NULL, "website" character varying NOT NULL, "docs" character varying, "tsv" tsvector NOT NULL, CONSTRAINT "UQ_f36adbb7b096ceeb6f3e80ad14c" UNIQUE ("name"), CONSTRAINT "UQ_8993112cd607f65268a4f57da39" UNIQUE ("slug"), CONSTRAINT "PK_9478629fc093d229df09e560aea" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "AppName" ON "app" ("name") `);
        await queryRunner.query(`CREATE TABLE "batch_job" ("id" character varying NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "type" text NOT NULL, "created_by" character varying, "context" jsonb, "result" jsonb, "dry_run" boolean NOT NULL DEFAULT false, "pre_processed_at" TIMESTAMP WITH TIME ZONE, "processing_at" TIMESTAMP WITH TIME ZONE, "confirmed_at" TIMESTAMP WITH TIME ZONE, "completed_at" TIMESTAMP WITH TIME ZONE, "canceled_at" TIMESTAMP WITH TIME ZONE, "failed_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_e57f84d485145d5be96bc6d871e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "team_component" ("component_id" character varying NOT NULL, "team_id" character varying NOT NULL, CONSTRAINT "PK_e56ea991531bfa78d9dd927f259" PRIMARY KEY ("component_id", "team_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_08ca98b53417e04d2f03e0e47f" ON "team_component" ("component_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_ec88432c85e2a60bed862478be" ON "team_component" ("team_id") `);
        await queryRunner.query(`CREATE TABLE "team_members" ("team_id" character varying NOT NULL, "user_id" character varying NOT NULL, CONSTRAINT "PK_1d3c06a8217a8785e2af0ec4ab8" PRIMARY KEY ("team_id", "user_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_fdad7d5768277e60c40e01cdce" ON "team_members" ("team_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_c2bf4967c8c2a6b845dadfbf3d" ON "team_members" ("user_id") `);
        await queryRunner.query(`ALTER TABLE "invite" ADD CONSTRAINT "FK_93c8e1293a27e75d6b84b0330c1" FOREIGN KEY ("organisation_id") REFERENCES "organisation"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "team" ADD CONSTRAINT "FK_f86f7d0f12e5ce185e6813b040d" FOREIGN KEY ("organisation_id") REFERENCES "organisation"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "o_auth" ADD CONSTRAINT "FK_799055234a19c2dbe4f9af12bf3" FOREIGN KEY ("organisation_id") REFERENCES "organisation"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "event" ADD CONSTRAINT "FK_d675c498cf7d8e129e0f655cbb0" FOREIGN KEY ("oauth_id") REFERENCES "o_auth"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "event" ADD CONSTRAINT "FK_035c9a57e7f1391a44b79b6c015" FOREIGN KEY ("organisation_id") REFERENCES "organisation"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "event" ADD CONSTRAINT "FK_3b3b1b8362ad7c552578ddf8d53" FOREIGN KEY ("component_id") REFERENCES "component"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "component" ADD CONSTRAINT "FK_42d487305c32894f346803abb87" FOREIGN KEY ("organisation_id") REFERENCES "organisation"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_c7a4825eaaf9118259b890ad65d" FOREIGN KEY ("organisation_id") REFERENCES "organisation"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "team_component" ADD CONSTRAINT "FK_08ca98b53417e04d2f03e0e47f3" FOREIGN KEY ("component_id") REFERENCES "component"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "team_component" ADD CONSTRAINT "FK_ec88432c85e2a60bed862478be3" FOREIGN KEY ("team_id") REFERENCES "team"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "team_members" ADD CONSTRAINT "FK_fdad7d5768277e60c40e01cdcea" FOREIGN KEY ("team_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "team_members" ADD CONSTRAINT "FK_c2bf4967c8c2a6b845dadfbf3d4" FOREIGN KEY ("user_id") REFERENCES "team"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "team_members" DROP CONSTRAINT "FK_c2bf4967c8c2a6b845dadfbf3d4"`);
        await queryRunner.query(`ALTER TABLE "team_members" DROP CONSTRAINT "FK_fdad7d5768277e60c40e01cdcea"`);
        await queryRunner.query(`ALTER TABLE "team_component" DROP CONSTRAINT "FK_ec88432c85e2a60bed862478be3"`);
        await queryRunner.query(`ALTER TABLE "team_component" DROP CONSTRAINT "FK_08ca98b53417e04d2f03e0e47f3"`);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_c7a4825eaaf9118259b890ad65d"`);
        await queryRunner.query(`ALTER TABLE "component" DROP CONSTRAINT "FK_42d487305c32894f346803abb87"`);
        await queryRunner.query(`ALTER TABLE "event" DROP CONSTRAINT "FK_3b3b1b8362ad7c552578ddf8d53"`);
        await queryRunner.query(`ALTER TABLE "event" DROP CONSTRAINT "FK_035c9a57e7f1391a44b79b6c015"`);
        await queryRunner.query(`ALTER TABLE "event" DROP CONSTRAINT "FK_d675c498cf7d8e129e0f655cbb0"`);
        await queryRunner.query(`ALTER TABLE "o_auth" DROP CONSTRAINT "FK_799055234a19c2dbe4f9af12bf3"`);
        await queryRunner.query(`ALTER TABLE "team" DROP CONSTRAINT "FK_f86f7d0f12e5ce185e6813b040d"`);
        await queryRunner.query(`ALTER TABLE "invite" DROP CONSTRAINT "FK_93c8e1293a27e75d6b84b0330c1"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c2bf4967c8c2a6b845dadfbf3d"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_fdad7d5768277e60c40e01cdce"`);
        await queryRunner.query(`DROP TABLE "team_members"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ec88432c85e2a60bed862478be"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_08ca98b53417e04d2f03e0e47f"`);
        await queryRunner.query(`DROP TABLE "team_component"`);
        await queryRunner.query(`DROP TABLE "batch_job"`);
        await queryRunner.query(`DROP INDEX "public"."AppName"`);
        await queryRunner.query(`DROP TABLE "app"`);
        await queryRunner.query(`DROP TYPE "public"."app_category_enum"`);
        await queryRunner.query(`DROP TYPE "public"."app_name_enum"`);
        await queryRunner.query(`DROP TABLE "staged_job"`);
        await queryRunner.query(`DROP INDEX "public"."UserOrganisationId"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e12875dfb3b1d92d7d7c5377e2"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TYPE "public"."user_role_enum"`);
        await queryRunner.query(`DROP TABLE "organisation"`);
        await queryRunner.query(`DROP TABLE "component"`);
        await queryRunner.query(`DROP TYPE "public"."component_type_enum"`);
        await queryRunner.query(`DROP TABLE "event"`);
        await queryRunner.query(`DROP INDEX "public"."OAuthAppName"`);
        await queryRunner.query(`DROP TABLE "o_auth"`);
        await queryRunner.query(`DROP TYPE "public"."o_auth_app_name_enum"`);
        await queryRunner.query(`DROP TABLE "team"`);
        await queryRunner.query(`DROP INDEX "public"."InviteOrganisationId"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_6b0ce4b4bcfd24491510bf19d1"`);
        await queryRunner.query(`DROP TABLE "invite"`);
        await queryRunner.query(`DROP TYPE "public"."invite_role_enum"`);
    }

}
