import { MigrationInterface, QueryRunner } from "typeorm";

export class Adddocumentmetadatamodel1715054351330 implements MigrationInterface {
    name = 'Adddocumentmetadatamodel1715054351330'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."document_metadata_type_enum" AS ENUM('pdf', 'text', 'docx', 'html', 'md')`);
        await queryRunner.query(`CREATE TYPE "public"."document_metadata_source_enum" AS ENUM('asana', 'confluence', 'github', 'gmail', 'google-drive', 'jira', 'notion', 'slack')`);
        await queryRunner.query(`CREATE TABLE "document_metadata" ("id" character varying NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "link" character varying NOT NULL, "title" character varying NOT NULL, "type" "public"."document_metadata_type_enum" NOT NULL, "source" "public"."document_metadata_source_enum" NOT NULL, "organisation_id" character varying NOT NULL, CONSTRAINT "UQ_b213a1ec4a3a720fed5cf55aa6d" UNIQUE ("link"), CONSTRAINT "PK_74b81e5979bc9e440e8d40f07e4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "o_auth" ALTER COLUMN "last_sync" SET DEFAULT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "o_auth" ALTER COLUMN "last_sync" DROP DEFAULT`);
        await queryRunner.query(`DROP TABLE "document_metadata"`);
        await queryRunner.query(`DROP TYPE "public"."document_metadata_source_enum"`);
        await queryRunner.query(`DROP TYPE "public"."document_metadata_type_enum"`);
    }

}
