import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAppDefinationsMigration1714627282061 implements MigrationInterface {
    name = 'AddAppDefinationsMigration1714627282061'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."o_auth_app_name_enum" RENAME TO "o_auth_app_name_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."o_auth_app_name_enum" AS ENUM('asana', 'confluence', 'github', 'gmail', 'google-drive', 'jira', 'notion', 'slack', 'webConnector')`);
        await queryRunner.query(`ALTER TABLE "o_auth" ALTER COLUMN "app_name" TYPE "public"."o_auth_app_name_enum" USING "app_name"::"text"::"public"."o_auth_app_name_enum"`);
        await queryRunner.query(`DROP TYPE "public"."o_auth_app_name_enum_old"`);
        await queryRunner.query(`ALTER TABLE "o_auth" ALTER COLUMN "last_sync" SET DEFAULT NULL`);
        await queryRunner.query(`ALTER TYPE "public"."app_name_enum" RENAME TO "app_name_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."app_name_enum" AS ENUM('asana', 'confluence', 'github', 'gmail', 'google-drive', 'jira', 'notion', 'slack', 'webConnector')`);
        await queryRunner.query(`ALTER TABLE "app" ALTER COLUMN "name" TYPE "public"."app_name_enum" USING "name"::"text"::"public"."app_name_enum"`);
        await queryRunner.query(`DROP TYPE "public"."app_name_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."app_name_enum_old" AS ENUM('asana', 'confluence', 'github', 'gmail', 'google-drive', 'jira', 'notion', 'slack')`);
        await queryRunner.query(`ALTER TABLE "app" ALTER COLUMN "name" TYPE "public"."app_name_enum_old" USING "name"::"text"::"public"."app_name_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."app_name_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."app_name_enum_old" RENAME TO "app_name_enum"`);
        await queryRunner.query(`ALTER TABLE "o_auth" ALTER COLUMN "last_sync" DROP DEFAULT`);
        await queryRunner.query(`CREATE TYPE "public"."o_auth_app_name_enum_old" AS ENUM('asana', 'confluence', 'github', 'gmail', 'google-drive', 'jira', 'notion', 'slack')`);
        await queryRunner.query(`ALTER TABLE "o_auth" ALTER COLUMN "app_name" TYPE "public"."o_auth_app_name_enum_old" USING "app_name"::"text"::"public"."o_auth_app_name_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."o_auth_app_name_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."o_auth_app_name_enum_old" RENAME TO "o_auth_app_name_enum"`);
    }

}
