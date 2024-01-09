import { MigrationInterface, QueryRunner } from "typeorm";

export class AddStagedJobModel1704813020795 implements MigrationInterface {
    name = 'AddStagedJobModel1704813020795'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "staged_job" ("id" character varying NOT NULL, "event_name" character varying NOT NULL, "data" jsonb NOT NULL, "options" jsonb NOT NULL DEFAULT '{}', CONSTRAINT "PK_9a28fb48c46c5509faf43ac8c8d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TYPE "public"."invite_role_enum" RENAME TO "invite_role_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."UserRoles" AS ENUM('admin', 'member')`);
        await queryRunner.query(`ALTER TABLE "invite" ALTER COLUMN "role" TYPE "public"."UserRoles" USING "role"::"text"::"public"."UserRoles"`);
        await queryRunner.query(`DROP TYPE "public"."invite_role_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."invite_role_enum_old" AS ENUM('admin', 'member')`);
        await queryRunner.query(`ALTER TABLE "invite" ALTER COLUMN "role" TYPE "public"."invite_role_enum_old" USING "role"::"text"::"public"."invite_role_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."UserRoles"`);
        await queryRunner.query(`ALTER TYPE "public"."invite_role_enum_old" RENAME TO "invite_role_enum"`);
        await queryRunner.query(`DROP TABLE "staged_job"`);
    }

}
