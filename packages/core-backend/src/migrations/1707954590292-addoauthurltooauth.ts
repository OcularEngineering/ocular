import { MigrationInterface, QueryRunner } from "typeorm";

export class Addoauthurltooauth1707954590292 implements MigrationInterface {
    name = 'Addoauthurltooauth1707954590292'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "o_auth" DROP COLUMN "data"`);
        await queryRunner.query(`ALTER TABLE "o_auth" DROP COLUMN "app_id"`);
        await queryRunner.query(`CREATE TYPE "public"."o_auth_app_name_enum" AS ENUM('github')`);
        await queryRunner.query(`ALTER TABLE "o_auth" ADD "app_name" "public"."o_auth_app_name_enum" NOT NULL`);
        await queryRunner.query(`ALTER TABLE "o_auth" ADD CONSTRAINT "UQ_026376087dad9c5d704696d7738" UNIQUE ("app_name")`);
        await queryRunner.query(`CREATE INDEX "OAuthAppName" ON "o_auth" ("app_name") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."OAuthAppName"`);
        await queryRunner.query(`ALTER TABLE "o_auth" DROP CONSTRAINT "UQ_026376087dad9c5d704696d7738"`);
        await queryRunner.query(`ALTER TABLE "o_auth" DROP COLUMN "app_name"`);
        await queryRunner.query(`DROP TYPE "public"."o_auth_app_name_enum"`);
        await queryRunner.query(`ALTER TABLE "o_auth" ADD "app_id" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "o_auth" ADD "data" jsonb`);
    }

}
