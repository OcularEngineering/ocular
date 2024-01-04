import { MigrationInterface, QueryRunner } from "typeorm";

export class Baseentityuuid1704388650393 implements MigrationInterface {
    name = 'Baseentityuuid1704388650393'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_c7a4825eaaf9118259b890ad65d"`);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "PK_cace4a159ff9f2512dd42373760"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "id" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id")`);
        await queryRunner.query(`DROP INDEX "public"."UserOrganisationId"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "organisation_id"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "organisation_id" character varying`);
        await queryRunner.query(`ALTER TABLE "organisation" DROP CONSTRAINT "PK_c725ae234ef1b74cce43d2d00c1"`);
        await queryRunner.query(`ALTER TABLE "organisation" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "organisation" ADD "id" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "organisation" ADD CONSTRAINT "PK_c725ae234ef1b74cce43d2d00c1" PRIMARY KEY ("id")`);
        await queryRunner.query(`CREATE INDEX "UserOrganisationId" ON "user" ("organisation_id") `);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_c7a4825eaaf9118259b890ad65d" FOREIGN KEY ("organisation_id") REFERENCES "organisation"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_c7a4825eaaf9118259b890ad65d"`);
        await queryRunner.query(`DROP INDEX "public"."UserOrganisationId"`);
        await queryRunner.query(`ALTER TABLE "organisation" DROP CONSTRAINT "PK_c725ae234ef1b74cce43d2d00c1"`);
        await queryRunner.query(`ALTER TABLE "organisation" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "organisation" ADD "id" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "organisation" ADD CONSTRAINT "PK_c725ae234ef1b74cce43d2d00c1" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "organisation_id"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "organisation_id" uuid`);
        await queryRunner.query(`CREATE INDEX "UserOrganisationId" ON "user" ("organisation_id") `);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "PK_cace4a159ff9f2512dd42373760"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "id" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_c7a4825eaaf9118259b890ad65d" FOREIGN KEY ("organisation_id") REFERENCES "organisation"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
