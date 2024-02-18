import { MigrationInterface, QueryRunner } from "typeorm";

export class Removestatefromapp1708037367805 implements MigrationInterface {
    name = 'Removestatefromapp1708037367805'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "app" DROP COLUMN "state"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "app" ADD "state" character varying`);
    }

}
