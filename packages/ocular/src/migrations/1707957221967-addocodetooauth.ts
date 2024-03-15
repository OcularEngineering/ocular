import { MigrationInterface, QueryRunner } from "typeorm";

export class Addocodetooauth1707957221967 implements MigrationInterface {
    name = 'Addocodetooauth1707957221967'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "o_auth" ADD "code" character varying NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "o_auth" DROP COLUMN "code"`);
    }

}
