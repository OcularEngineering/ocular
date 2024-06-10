import { MigrationInterface, QueryRunner } from "typeorm";

export class AddGeneralizingAuthorizationMigration1717716195099
  implements MigrationInterface
{
  name = "AddGeneralizingAuthorizationMigration1717716195099";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "event" DROP CONSTRAINT "FK_d675c498cf7d8e129e0f655cbb0"`
    );
    await queryRunner.query(
      `ALTER TABLE "event" RENAME COLUMN "oauth_id" TO "app_authorization_id"`
    );
    await queryRunner.query(
      `CREATE TYPE "public"."app_authorization_app_name_enum" AS ENUM('asana', 'confluence', 'github', 'gmail', 'google-drive', 'jira', 'notion', 'slack', 'web-connector', 'bitbucket', 'ocular-api')`
    );
    await queryRunner.query(
      `CREATE TYPE "public"."app_authorization_auth_strategy_enum" AS ENUM('APITOKEN', 'OAUTHTOKEN')`
    );
    await queryRunner.query(
      `CREATE TABLE "app_authorization" ("id" character varying NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "app_name" "public"."app_authorization_app_name_enum" NOT NULL, "auth_strategy" "public"."app_authorization_auth_strategy_enum" NOT NULL, "type" character varying NOT NULL, "token" character varying NOT NULL, "token_expires_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "refresh_token" character varying NOT NULL, "refresh_token_expires_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "last_sync" TIMESTAMP WITH TIME ZONE DEFAULT NULL, "organisation_id" character varying, "metadata" jsonb, CONSTRAINT "PK_264caceb983ae5c4163e7b1577f" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE INDEX "AuthorizationAppName" ON "app_authorization" ("app_name") `
    );
    await queryRunner.query(
      `ALTER TABLE "event" ADD CONSTRAINT "FK_f2d4c6d9d10995441278cdb9f94" FOREIGN KEY ("app_authorization_id") REFERENCES "app_authorization"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "app_authorization" ADD CONSTRAINT "FK_bc6c6c63a2b6a5a07ffe6faea41" FOREIGN KEY ("organisation_id") REFERENCES "organisation"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "app_authorization" DROP CONSTRAINT "FK_bc6c6c63a2b6a5a07ffe6faea41"`
    );
    await queryRunner.query(
      `ALTER TABLE "event" DROP CONSTRAINT "FK_f2d4c6d9d10995441278cdb9f94"`
    );
    await queryRunner.query(`DROP INDEX "public"."AuthorizationAppName"`);
    await queryRunner.query(`DROP TABLE "app_authorization"`);
    await queryRunner.query(
      `DROP TYPE "public"."app_authorization_auth_strategy_enum"`
    );
    await queryRunner.query(
      `DROP TYPE "public"."app_authorization_app_name_enum"`
    );
    await queryRunner.query(
      `ALTER TABLE "event" RENAME COLUMN "app_authorization_id" TO "oauth_id"`
    );
    await queryRunner.query(
      `ALTER TABLE "event" ADD CONSTRAINT "FK_d675c498cf7d8e129e0f655cbb0" FOREIGN KEY ("oauth_id") REFERENCES "o_auth"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }
}
