import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAppAuthStrategy1716905903179 implements MigrationInterface {
    name = 'AddAppAuthStrategy1716905903179'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."o_auth_auth_strategy_enum" AS ENUM('APITOKEN', 'OAUTHTOKEN')`);
        await queryRunner.query(`ALTER TABLE "o_auth" ADD "auth_strategy" "public"."o_auth_auth_strategy_enum" NOT NULL`);
        await queryRunner.query(`CREATE TYPE "public"."app_auth_strategy_enum" AS ENUM('APITOKEN', 'OAUTHTOKEN')`);
        await queryRunner.query(`ALTER TABLE "app" ADD "auth_strategy" "public"."app_auth_strategy_enum" NOT NULL`);
        await queryRunner.query(`ALTER TABLE "o_auth" ALTER COLUMN "last_sync" SET DEFAULT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "o_auth" ALTER COLUMN "last_sync" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "app" DROP COLUMN "auth_strategy"`);
        await queryRunner.query(`DROP TYPE "public"."app_auth_strategy_enum"`);
        await queryRunner.query(`ALTER TABLE "o_auth" DROP COLUMN "auth_strategy"`);
        await queryRunner.query(`DROP TYPE "public"."o_auth_auth_strategy_enum"`);
    }

}
