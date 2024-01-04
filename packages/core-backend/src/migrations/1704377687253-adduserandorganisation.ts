import { MigrationInterface, QueryRunner } from "typeorm";

export class Adduserandorganisation1704377687253 implements MigrationInterface {
    name = 'Adduserandorganisation1704377687253'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."user_role_enum" AS ENUM('admin', 'member')`);
        await queryRunner.query(`CREATE TABLE "user" ("id" uuid NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "role" "public"."user_role_enum" DEFAULT 'member', "email" character varying NOT NULL, "first_name" character varying, "last_name" character varying, "password_hash" character varying, "metadata" jsonb, "organisation_id" uuid, CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_e12875dfb3b1d92d7d7c5377e2" ON "user" ("email") `);
        await queryRunner.query(`CREATE INDEX "UserOrganisationId" ON "user" ("organisation_id") `);
        await queryRunner.query(`CREATE TABLE "organisation" ("id" uuid NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "name" character varying NOT NULL DEFAULT 'Org', "invite_link_template" text, "metadata" jsonb, CONSTRAINT "PK_c725ae234ef1b74cce43d2d00c1" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_c7a4825eaaf9118259b890ad65d" FOREIGN KEY ("organisation_id") REFERENCES "organisation"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_c7a4825eaaf9118259b890ad65d"`);
        await queryRunner.query(`DROP TABLE "organisation"`);
        await queryRunner.query(`DROP INDEX "public"."UserOrganisationId"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e12875dfb3b1d92d7d7c5377e2"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TYPE "public"."user_role_enum"`);
    }

}
