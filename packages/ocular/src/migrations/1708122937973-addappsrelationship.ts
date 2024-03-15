import { MigrationInterface, QueryRunner } from "typeorm";

export class Addappsrelationship1708122937973 implements MigrationInterface {
    name = 'Addappsrelationship1708122937973'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "organisation" ADD "installed_apps" json`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "organisation" DROP COLUMN "installed_apps"`);
    }

}
