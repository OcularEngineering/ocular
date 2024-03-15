import { MigrationInterface, QueryRunner } from "typeorm";

export class AddApp1707983944511 implements MigrationInterface {
    name = 'AddApp1707983944511'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "o_auth" ("id" character varying NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "app_name" "public"."o_auth_app_name_enum" NOT NULL, "code" character varying NOT NULL, "organisation_id" character varying, CONSTRAINT "UQ_026376087dad9c5d704696d7738" UNIQUE ("app_name"), CONSTRAINT "PK_10172120973beff91c304345fa3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "OAuthAppName" ON "o_auth" ("app_name") `);
        await queryRunner.query(`CREATE TYPE "public"."app_category_enum" AS ENUM('Software Development')`);
        await queryRunner.query(`CREATE TABLE "app" ("id" character varying NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "name" "public"."app_name_enum" NOT NULL, "state" character varying, "oauth_url" character varying, "install_url" character varying, "uninstall_url" character varying, "slug" character varying NOT NULL, "category" "public"."app_category_enum" NOT NULL, "developer" character varying NOT NULL, "logo" character varying NOT NULL, "images" character varying array DEFAULT '{}', "overview" character varying NOT NULL, "description" character varying NOT NULL, "website" character varying NOT NULL, "docs" character varying, "tsv" tsvector NOT NULL, CONSTRAINT "UQ_f36adbb7b096ceeb6f3e80ad14c" UNIQUE ("name"), CONSTRAINT "UQ_8993112cd607f65268a4f57da39" UNIQUE ("slug"), CONSTRAINT "PK_9478629fc093d229df09e560aea" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "AppName" ON "app" ("name") `);
        await queryRunner.query(`ALTER TABLE "o_auth" ADD CONSTRAINT "FK_799055234a19c2dbe4f9af12bf3" FOREIGN KEY ("organisation_id") REFERENCES "organisation"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "event" ADD CONSTRAINT "FK_d675c498cf7d8e129e0f655cbb0" FOREIGN KEY ("oauth_id") REFERENCES "o_auth"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "event" DROP CONSTRAINT "FK_d675c498cf7d8e129e0f655cbb0"`);
        await queryRunner.query(`ALTER TABLE "o_auth" DROP CONSTRAINT "FK_799055234a19c2dbe4f9af12bf3"`);
        await queryRunner.query(`DROP INDEX "public"."AppName"`);
        await queryRunner.query(`DROP TABLE "app"`);
        await queryRunner.query(`DROP TYPE "public"."app_category_enum"`);
        await queryRunner.query(`DROP INDEX "public"."OAuthAppName"`);
        await queryRunner.query(`DROP TABLE "o_auth"`);
    }

}
