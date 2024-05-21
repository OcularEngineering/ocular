import { MigrationInterface, QueryRunner } from "typeorm";

export class Renamedoctypetxt1716240473567 implements MigrationInterface {
    name = 'Renamedoctypetxt1716240473567'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "o_auth" ALTER COLUMN "last_sync" SET DEFAULT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "o_auth" ALTER COLUMN "last_sync" DROP DEFAULT`);
    }

}
