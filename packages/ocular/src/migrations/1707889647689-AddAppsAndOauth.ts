import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAppsAndOauth1707889647689 implements MigrationInterface {
    name = 'AddAppsAndOauth1707889647689'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "o_auth" DROP CONSTRAINT "FK_ae53c1301373e783879493511ed"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_f36adbb7b096ceeb6f3e80ad14"`);
        await queryRunner.query(`CREATE TABLE "event" ("id" character varying NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "name" character varying NOT NULL, "description" character varying, "oauth_id" character varying, "organisation_id" character varying, "component_id" character varying, CONSTRAINT "PK_30c2f3bbaf6d34a55f8ae6e4614" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "app" ADD "identifier" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "app" ADD CONSTRAINT "UQ_9dbaea7b8513494cb78279b0a42" UNIQUE ("identifier")`);
        await queryRunner.query(`ALTER TABLE "app" ADD "logo" character varying`);
        await queryRunner.query(`ALTER TABLE "app" ADD "description" character varying`);
        await queryRunner.query(`ALTER TABLE "app" ADD "website" character varying`);
        await queryRunner.query(`ALTER TABLE "o_auth" ALTER COLUMN "app_id" SET NOT NULL`);
        await queryRunner.query(`CREATE INDEX "AppName" ON "app" ("name") `);
        await queryRunner.query(`ALTER TABLE "event" ADD CONSTRAINT "FK_d675c498cf7d8e129e0f655cbb0" FOREIGN KEY ("oauth_id") REFERENCES "o_auth"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "event" ADD CONSTRAINT "FK_035c9a57e7f1391a44b79b6c015" FOREIGN KEY ("organisation_id") REFERENCES "organisation"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "event" ADD CONSTRAINT "FK_3b3b1b8362ad7c552578ddf8d53" FOREIGN KEY ("component_id") REFERENCES "component"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "event" DROP CONSTRAINT "FK_3b3b1b8362ad7c552578ddf8d53"`);
        await queryRunner.query(`ALTER TABLE "event" DROP CONSTRAINT "FK_035c9a57e7f1391a44b79b6c015"`);
        await queryRunner.query(`ALTER TABLE "event" DROP CONSTRAINT "FK_d675c498cf7d8e129e0f655cbb0"`);
        await queryRunner.query(`DROP INDEX "public"."AppName"`);
        await queryRunner.query(`ALTER TABLE "o_auth" ALTER COLUMN "app_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "app" DROP COLUMN "website"`);
        await queryRunner.query(`ALTER TABLE "app" DROP COLUMN "description"`);
        await queryRunner.query(`ALTER TABLE "app" DROP COLUMN "logo"`);
        await queryRunner.query(`ALTER TABLE "app" DROP CONSTRAINT "UQ_9dbaea7b8513494cb78279b0a42"`);
        await queryRunner.query(`ALTER TABLE "app" DROP COLUMN "identifier"`);
        await queryRunner.query(`DROP TABLE "event"`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_f36adbb7b096ceeb6f3e80ad14" ON "app" ("name") `);
        await queryRunner.query(`ALTER TABLE "o_auth" ADD CONSTRAINT "FK_ae53c1301373e783879493511ed" FOREIGN KEY ("app_id") REFERENCES "app"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
