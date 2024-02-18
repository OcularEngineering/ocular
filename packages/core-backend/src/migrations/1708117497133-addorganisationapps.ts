import { MigrationInterface, QueryRunner } from "typeorm";

export class Addorganisationapps1708117497133 implements MigrationInterface {
    name = 'Addorganisationapps1708117497133'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "organisation_apps_app" ("organisationId" character varying NOT NULL, "appId" character varying NOT NULL, CONSTRAINT "PK_66dadc2da2e5701cf385eb4ca2c" PRIMARY KEY ("organisationId", "appId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_32aabc2e3af47556315d42c593" ON "organisation_apps_app" ("organisationId") `);
        await queryRunner.query(`CREATE INDEX "IDX_09a3f07de73a0dade743da56db" ON "organisation_apps_app" ("appId") `);
        await queryRunner.query(`ALTER TABLE "organisation_apps_app" ADD CONSTRAINT "FK_32aabc2e3af47556315d42c5934" FOREIGN KEY ("organisationId") REFERENCES "organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "organisation_apps_app" ADD CONSTRAINT "FK_09a3f07de73a0dade743da56db5" FOREIGN KEY ("appId") REFERENCES "app"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "organisation_apps_app" DROP CONSTRAINT "FK_09a3f07de73a0dade743da56db5"`);
        await queryRunner.query(`ALTER TABLE "organisation_apps_app" DROP CONSTRAINT "FK_32aabc2e3af47556315d42c5934"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_09a3f07de73a0dade743da56db"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_32aabc2e3af47556315d42c593"`);
        await queryRunner.query(`DROP TABLE "organisation_apps_app"`);
    }

}
