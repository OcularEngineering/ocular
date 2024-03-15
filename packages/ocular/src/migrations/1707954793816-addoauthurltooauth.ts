import { MigrationInterface, QueryRunner } from "typeorm";

export class Addoauthurltooauth1707954793816 implements MigrationInterface {
    name = 'Addoauthurltooauth1707954793816'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "app" ADD "oauth_url" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "app" DROP COLUMN "oauth_url"`);
    }

}
