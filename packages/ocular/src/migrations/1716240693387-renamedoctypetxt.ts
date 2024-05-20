import { MigrationInterface, QueryRunner } from "typeorm";

export class Renamedoctypetxt1716240693387 implements MigrationInterface {
    name = 'Renamedoctypetxt1716240693387'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "o_auth" ALTER COLUMN "last_sync" SET DEFAULT NULL`);
        await queryRunner.query(`ALTER TYPE "public"."document_metadata_type_enum" RENAME TO "document_metadata_type_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."document_metadata_type_enum" AS ENUM('pdf', 'txt', 'docx', 'html', 'md')`);
        await queryRunner.query(`ALTER TABLE "document_metadata" ALTER COLUMN "type" TYPE "public"."document_metadata_type_enum" USING "type"::"text"::"public"."document_metadata_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."document_metadata_type_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."document_metadata_type_enum_old" AS ENUM('pdf', 'text', 'docx', 'html', 'md')`);
        await queryRunner.query(`ALTER TABLE "document_metadata" ALTER COLUMN "type" TYPE "public"."document_metadata_type_enum_old" USING "type"::"text"::"public"."document_metadata_type_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."document_metadata_type_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."document_metadata_type_enum_old" RENAME TO "document_metadata_type_enum"`);
        await queryRunner.query(`ALTER TABLE "o_auth" ALTER COLUMN "last_sync" DROP DEFAULT`);
    }

}
