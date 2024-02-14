import { MigrationInterface, QueryRunner } from "typeorm";

export class AddStateToApp1707937767706 implements MigrationInterface {
    name = 'AddStateToApp1707937767706'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "app" ADD "state" character varying`);
        await queryRunner.query(`DROP INDEX "public"."AppName"`);
        await queryRunner.query(`ALTER TABLE "app" DROP COLUMN "name"`);
        await queryRunner.query(`CREATE TYPE "public"."app_name_enum" AS ENUM('github')`);
        await queryRunner.query(`ALTER TABLE "app" ADD "name" "public"."app_name_enum" NOT NULL`);
        await queryRunner.query(`ALTER TABLE "app" ADD CONSTRAINT "UQ_f36adbb7b096ceeb6f3e80ad14c" UNIQUE ("name")`);
        await queryRunner.query(`CREATE INDEX "AppName" ON "app" ("name") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."AppName"`);
        await queryRunner.query(`ALTER TABLE "app" DROP CONSTRAINT "UQ_f36adbb7b096ceeb6f3e80ad14c"`);
        await queryRunner.query(`ALTER TABLE "app" DROP COLUMN "name"`);
        await queryRunner.query(`DROP TYPE "public"."app_name_enum"`);
        await queryRunner.query(`ALTER TABLE "app" ADD "name" character varying NOT NULL`);
        await queryRunner.query(`CREATE INDEX "AppName" ON "app" ("name") `);
        await queryRunner.query(`ALTER TABLE "app" DROP COLUMN "state"`);
    }

}
