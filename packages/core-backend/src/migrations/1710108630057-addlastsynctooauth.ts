import { MigrationInterface, QueryRunner } from "typeorm";

export class Addlastsynctooauth1710108630057 implements MigrationInterface {
    name = 'Addlastsynctooauth1710108630057'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "o_auth" ADD "last_sync" TIMESTAMP WITH TIME ZONE DEFAULT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "o_auth" DROP COLUMN "last_sync"`);
    }

}
