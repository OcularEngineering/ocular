import { MigrationInterface, QueryRunner } from "typeorm";

export class AddNewAppDefinations1715166675852 implements MigrationInterface {
    name = 'AddNewAppDefinations1715166675852'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "event" ("id" character varying NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "name" character varying NOT NULL, "description" character varying, "oauth_id" character varying, "organisation_id" character varying, "component_id" character varying, CONSTRAINT "PK_30c2f3bbaf6d34a55f8ae6e4614" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."o_auth_app_name_enum" AS ENUM('asana', 'confluence', 'github', 'gmail', 'google-drive', 'jira', 'notion', 'slack', 'webConnector', 'bitbucket')`);
        await queryRunner.query(`CREATE TABLE "o_auth" ("id" character varying NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "app_name" "public"."o_auth_app_name_enum" NOT NULL, "type" character varying NOT NULL, "token" character varying NOT NULL, "token_expires_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "refresh_token" character varying NOT NULL, "refresh_token_expires_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "last_sync" TIMESTAMP WITH TIME ZONE DEFAULT NULL, "organisation_id" character varying, "metadata" jsonb, CONSTRAINT "PK_10172120973beff91c304345fa3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "OAuthAppName" ON "o_auth" ("app_name") `);
        await queryRunner.query(`CREATE TABLE "organisation" ("id" character varying NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "name" character varying NOT NULL DEFAULT 'Org', "installed_apps" json, "invite_link_template" text, "metadata" jsonb, CONSTRAINT "PK_c725ae234ef1b74cce43d2d00c1" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."user_role_enum" AS ENUM('admin', 'member')`);
        await queryRunner.query(`CREATE TABLE "user" ("id" character varying NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "role" "public"."user_role_enum" DEFAULT 'member', "email" character varying NOT NULL, "first_name" character varying, "last_name" character varying, "password_hash" character varying, "metadata" jsonb, "organisation_id" character varying, CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_e12875dfb3b1d92d7d7c5377e2" ON "user" ("email") `);
        await queryRunner.query(`CREATE INDEX "UserOrganisationId" ON "user" ("organisation_id") `);
        await queryRunner.query(`CREATE TABLE "staged_job" ("id" character varying NOT NULL, "event_name" character varying NOT NULL, "data" jsonb NOT NULL, "options" jsonb NOT NULL DEFAULT '{}', CONSTRAINT "PK_9a28fb48c46c5509faf43ac8c8d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "chat" ("id" character varying NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "name" character varying NOT NULL, "user_id" character varying NOT NULL, "organisation_id" character varying NOT NULL, CONSTRAINT "PK_9d0b2ba74336710fd31154738a5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."message_role_enum" AS ENUM('assistant', 'user')`);
        await queryRunner.query(`CREATE TABLE "message" ("id" character varying NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "role" "public"."message_role_enum" NOT NULL, "content" character varying NOT NULL, "chat_id" character varying NOT NULL, "user_id" character varying NOT NULL, CONSTRAINT "PK_ba01f0a3e0123651915008bc578" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."app_name_enum" AS ENUM('asana', 'confluence', 'github', 'gmail', 'google-drive', 'jira', 'notion', 'slack', 'webConnector', 'bitbucket')`);
        await queryRunner.query(`CREATE TYPE "public"."app_category_enum" AS ENUM('Software Development', 'File Storage', 'Productivity', 'Documentation', 'Messaging')`);
        await queryRunner.query(`CREATE TABLE "app" ("id" character varying NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "name" "public"."app_name_enum" NOT NULL, "oauth_url" character varying, "install_url" character varying, "uninstall_url" character varying, "slug" character varying NOT NULL, "category" "public"."app_category_enum" NOT NULL, "developer" character varying NOT NULL, "logo" character varying NOT NULL, "images" character varying array DEFAULT '{}', "overview" character varying NOT NULL, "description" character varying NOT NULL, "website" character varying NOT NULL, "docs" character varying, "tsv" tsvector NOT NULL, CONSTRAINT "UQ_f36adbb7b096ceeb6f3e80ad14c" UNIQUE ("name"), CONSTRAINT "UQ_8993112cd607f65268a4f57da39" UNIQUE ("slug"), CONSTRAINT "PK_9478629fc093d229df09e560aea" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "AppName" ON "app" ("name") `);
        await queryRunner.query(`CREATE TABLE "batch_job" ("id" character varying NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "type" text NOT NULL, "created_by" character varying, "context" jsonb, "result" jsonb, "dry_run" boolean NOT NULL DEFAULT false, "pre_processed_at" TIMESTAMP WITH TIME ZONE, "processing_at" TIMESTAMP WITH TIME ZONE, "confirmed_at" TIMESTAMP WITH TIME ZONE, "completed_at" TIMESTAMP WITH TIME ZONE, "canceled_at" TIMESTAMP WITH TIME ZONE, "failed_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_e57f84d485145d5be96bc6d871e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."document_metadata_type_enum" AS ENUM('pdf', 'text', 'docx', 'html', 'md')`);
        await queryRunner.query(`CREATE TYPE "public"."document_metadata_source_enum" AS ENUM('asana', 'confluence', 'github', 'gmail', 'google-drive', 'jira', 'notion', 'slack', 'webConnector', 'bitbucket')`);
        await queryRunner.query(`CREATE TABLE "document_metadata" ("id" character varying NOT NULL, "link" character varying NOT NULL, "title" character varying NOT NULL, "type" "public"."document_metadata_type_enum" NOT NULL, "source" "public"."document_metadata_source_enum" NOT NULL, "organisation_id" character varying NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "UQ_b213a1ec4a3a720fed5cf55aa6d" UNIQUE ("link"), CONSTRAINT "PK_74b81e5979bc9e440e8d40f07e4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "event" ADD CONSTRAINT "FK_d675c498cf7d8e129e0f655cbb0" FOREIGN KEY ("oauth_id") REFERENCES "o_auth"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "event" ADD CONSTRAINT "FK_035c9a57e7f1391a44b79b6c015" FOREIGN KEY ("organisation_id") REFERENCES "organisation"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "o_auth" ADD CONSTRAINT "FK_799055234a19c2dbe4f9af12bf3" FOREIGN KEY ("organisation_id") REFERENCES "organisation"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_c7a4825eaaf9118259b890ad65d" FOREIGN KEY ("organisation_id") REFERENCES "organisation"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "message" ADD CONSTRAINT "FK_859ffc7f95098efb4d84d50c632" FOREIGN KEY ("chat_id") REFERENCES "chat"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "message" DROP CONSTRAINT "FK_859ffc7f95098efb4d84d50c632"`);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_c7a4825eaaf9118259b890ad65d"`);
        await queryRunner.query(`ALTER TABLE "o_auth" DROP CONSTRAINT "FK_799055234a19c2dbe4f9af12bf3"`);
        await queryRunner.query(`ALTER TABLE "event" DROP CONSTRAINT "FK_035c9a57e7f1391a44b79b6c015"`);
        await queryRunner.query(`ALTER TABLE "event" DROP CONSTRAINT "FK_d675c498cf7d8e129e0f655cbb0"`);
        await queryRunner.query(`DROP TABLE "document_metadata"`);
        await queryRunner.query(`DROP TYPE "public"."document_metadata_source_enum"`);
        await queryRunner.query(`DROP TYPE "public"."document_metadata_type_enum"`);
        await queryRunner.query(`DROP TABLE "batch_job"`);
        await queryRunner.query(`DROP INDEX "public"."AppName"`);
        await queryRunner.query(`DROP TABLE "app"`);
        await queryRunner.query(`DROP TYPE "public"."app_category_enum"`);
        await queryRunner.query(`DROP TYPE "public"."app_name_enum"`);
        await queryRunner.query(`DROP TABLE "message"`);
        await queryRunner.query(`DROP TYPE "public"."message_role_enum"`);
        await queryRunner.query(`DROP TABLE "chat"`);
        await queryRunner.query(`DROP TABLE "staged_job"`);
        await queryRunner.query(`DROP INDEX "public"."UserOrganisationId"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e12875dfb3b1d92d7d7c5377e2"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TYPE "public"."user_role_enum"`);
        await queryRunner.query(`DROP TABLE "organisation"`);
        await queryRunner.query(`DROP INDEX "public"."OAuthAppName"`);
        await queryRunner.query(`DROP TABLE "o_auth"`);
        await queryRunner.query(`DROP TYPE "public"."o_auth_app_name_enum"`);
        await queryRunner.query(`DROP TABLE "event"`);
    }

}
