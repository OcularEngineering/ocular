import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMetadata1719014894470 implements MigrationInterface {
    name = 'AddMetadata1719014894470'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "document_metadata" ADD "metadata" jsonb`);
        await queryRunner.query(`ALTER TABLE "app_authorization" ALTER COLUMN "last_sync" SET DEFAULT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "app_authorization" ALTER COLUMN "last_sync" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "document_metadata" DROP COLUMN "metadata"`);
    }

}
