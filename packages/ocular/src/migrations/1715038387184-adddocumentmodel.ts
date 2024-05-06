import { MigrationInterface, QueryRunner } from "typeorm";

export class Adddocumentmodel1715038387184 implements MigrationInterface {
    name = 'Adddocumentmodel1715038387184'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."document_type_enum" AS ENUM('pdf', 'text', 'docx', 'html', 'md')`);
        await queryRunner.query(`CREATE TYPE "public"."document_source_enum" AS ENUM('asana', 'confluence', 'github', 'gmail', 'google-drive', 'jira', 'notion', 'slack')`);
        await queryRunner.query(`CREATE TABLE "document" ("id" character varying NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "link" character varying NOT NULL, "title" character varying NOT NULL, "type" "public"."document_type_enum" NOT NULL, "source" "public"."document_source_enum" NOT NULL, "organisation_id" character varying NOT NULL, "metadata" jsonb, CONSTRAINT "UQ_898245feb4023ecf4039ae22454" UNIQUE ("link"), CONSTRAINT "PK_e57d3357f83f3cdc0acffc3d777" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "o_auth" ALTER COLUMN "last_sync" SET DEFAULT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "o_auth" ALTER COLUMN "last_sync" DROP DEFAULT`);
        await queryRunner.query(`DROP TABLE "document"`);
        await queryRunner.query(`DROP TYPE "public"."document_source_enum"`);
        await queryRunner.query(`DROP TYPE "public"."document_type_enum"`);
    }

}
