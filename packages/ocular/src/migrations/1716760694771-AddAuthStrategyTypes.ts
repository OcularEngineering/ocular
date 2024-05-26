import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAuthStrategyTypes1716760694771 implements MigrationInterface {
    name = 'AddAuthStrategyTypes1716760694771'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."o_auth_auth_strategy_enum" AS ENUM('API Token Strategy', 'OAuth Token Stratgey')`);
        await queryRunner.query(`ALTER TABLE "o_auth" ADD "auth_strategy" "public"."o_auth_auth_strategy_enum" NOT NULL`);
        await queryRunner.query(`ALTER TYPE "public"."o_auth_app_name_enum" RENAME TO "o_auth_app_name_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."o_auth_app_name_enum" AS ENUM('asana', 'confluence', 'github', 'gmail', 'google-drive', 'jira', 'notion', 'slack', 'webConnector', 'bitbucket', 'ocular-api')`);
        await queryRunner.query(`ALTER TABLE "o_auth" ALTER COLUMN "app_name" TYPE "public"."o_auth_app_name_enum" USING "app_name"::"text"::"public"."o_auth_app_name_enum"`);
        await queryRunner.query(`DROP TYPE "public"."o_auth_app_name_enum_old"`);
        await queryRunner.query(`ALTER TABLE "o_auth" ALTER COLUMN "last_sync" SET DEFAULT NULL`);
        await queryRunner.query(`ALTER TYPE "public"."app_name_enum" RENAME TO "app_name_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."app_name_enum" AS ENUM('asana', 'confluence', 'github', 'gmail', 'google-drive', 'jira', 'notion', 'slack', 'webConnector', 'bitbucket', 'ocular-api')`);
        await queryRunner.query(`ALTER TABLE "app" ALTER COLUMN "name" TYPE "public"."app_name_enum" USING "name"::"text"::"public"."app_name_enum"`);
        await queryRunner.query(`DROP TYPE "public"."app_name_enum_old"`);
        await queryRunner.query(`ALTER TYPE "public"."document_metadata_type_enum" RENAME TO "document_metadata_type_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."document_metadata_type_enum" AS ENUM('pdf', 'txt', 'docx', 'html', 'md', 'json', 'csv')`);
        await queryRunner.query(`ALTER TABLE "document_metadata" ALTER COLUMN "type" TYPE "public"."document_metadata_type_enum" USING "type"::"text"::"public"."document_metadata_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."document_metadata_type_enum_old"`);
        await queryRunner.query(`ALTER TYPE "public"."document_metadata_source_enum" RENAME TO "document_metadata_source_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."document_metadata_source_enum" AS ENUM('asana', 'confluence', 'github', 'gmail', 'google-drive', 'jira', 'notion', 'slack', 'webConnector', 'bitbucket', 'ocular-api')`);
        await queryRunner.query(`ALTER TABLE "document_metadata" ALTER COLUMN "source" TYPE "public"."document_metadata_source_enum" USING "source"::"text"::"public"."document_metadata_source_enum"`);
        await queryRunner.query(`DROP TYPE "public"."document_metadata_source_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."document_metadata_source_enum_old" AS ENUM('asana', 'confluence', 'github', 'gmail', 'google-drive', 'jira', 'notion', 'slack', 'webConnector', 'bitbucket')`);
        await queryRunner.query(`ALTER TABLE "document_metadata" ALTER COLUMN "source" TYPE "public"."document_metadata_source_enum_old" USING "source"::"text"::"public"."document_metadata_source_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."document_metadata_source_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."document_metadata_source_enum_old" RENAME TO "document_metadata_source_enum"`);
        await queryRunner.query(`CREATE TYPE "public"."document_metadata_type_enum_old" AS ENUM('pdf', 'text', 'docx', 'html', 'md')`);
        await queryRunner.query(`ALTER TABLE "document_metadata" ALTER COLUMN "type" TYPE "public"."document_metadata_type_enum_old" USING "type"::"text"::"public"."document_metadata_type_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."document_metadata_type_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."document_metadata_type_enum_old" RENAME TO "document_metadata_type_enum"`);
        await queryRunner.query(`CREATE TYPE "public"."app_name_enum_old" AS ENUM('asana', 'confluence', 'github', 'gmail', 'google-drive', 'jira', 'notion', 'slack', 'webConnector', 'bitbucket')`);
        await queryRunner.query(`ALTER TABLE "app" ALTER COLUMN "name" TYPE "public"."app_name_enum_old" USING "name"::"text"::"public"."app_name_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."app_name_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."app_name_enum_old" RENAME TO "app_name_enum"`);
        await queryRunner.query(`ALTER TABLE "o_auth" ALTER COLUMN "last_sync" DROP DEFAULT`);
        await queryRunner.query(`CREATE TYPE "public"."o_auth_app_name_enum_old" AS ENUM('asana', 'confluence', 'github', 'gmail', 'google-drive', 'jira', 'notion', 'slack', 'webConnector', 'bitbucket')`);
        await queryRunner.query(`ALTER TABLE "o_auth" ALTER COLUMN "app_name" TYPE "public"."o_auth_app_name_enum_old" USING "app_name"::"text"::"public"."o_auth_app_name_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."o_auth_app_name_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."o_auth_app_name_enum_old" RENAME TO "o_auth_app_name_enum"`);
        await queryRunner.query(`ALTER TABLE "o_auth" DROP COLUMN "auth_strategy"`);
        await queryRunner.query(`DROP TYPE "public"."o_auth_auth_strategy_enum"`);
    }

}
