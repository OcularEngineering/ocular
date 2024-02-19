import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateOauthFields1708312077912 implements MigrationInterface {
    name = 'UpdateOauthFields1708312077912'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "batch_job" ("id" character varying NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "type" text NOT NULL, "created_by" character varying, "context" jsonb, "result" jsonb, "dry_run" boolean NOT NULL DEFAULT false, "pre_processed_at" TIMESTAMP WITH TIME ZONE, "processing_at" TIMESTAMP WITH TIME ZONE, "confirmed_at" TIMESTAMP WITH TIME ZONE, "completed_at" TIMESTAMP WITH TIME ZONE, "canceled_at" TIMESTAMP WITH TIME ZONE, "failed_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_e57f84d485145d5be96bc6d871e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "o_auth" DROP COLUMN "code"`);
        await queryRunner.query(`ALTER TABLE "o_auth" ADD "type" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "o_auth" ADD "token" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "o_auth" ADD "token_expires_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "o_auth" ADD "refresh_token" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "o_auth" ADD "refresh_token_expires_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "batch_job" ADD CONSTRAINT "FK_cdf30493ba1c9ef207e1e80c10a" FOREIGN KEY ("created_by") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "batch_job" DROP CONSTRAINT "FK_cdf30493ba1c9ef207e1e80c10a"`);
        await queryRunner.query(`ALTER TABLE "o_auth" DROP COLUMN "refresh_token_expires_at"`);
        await queryRunner.query(`ALTER TABLE "o_auth" DROP COLUMN "refresh_token"`);
        await queryRunner.query(`ALTER TABLE "o_auth" DROP COLUMN "token_expires_at"`);
        await queryRunner.query(`ALTER TABLE "o_auth" DROP COLUMN "token"`);
        await queryRunner.query(`ALTER TABLE "o_auth" DROP COLUMN "type"`);
        await queryRunner.query(`ALTER TABLE "o_auth" ADD "code" character varying NOT NULL`);
        await queryRunner.query(`DROP TABLE "batch_job"`);
    }

}
