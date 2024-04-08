import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMessageAndChatModels1712535706989 implements MigrationInterface {
    name = 'AddMessageAndChatModels1712535706989'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "event" DROP CONSTRAINT "FK_3b3b1b8362ad7c552578ddf8d53"`);
        await queryRunner.query(`CREATE TYPE "public"."message_role_enum" AS ENUM('assistant', 'user')`);
        await queryRunner.query(`CREATE TABLE "message" ("id" character varying NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "role" "public"."message_role_enum" NOT NULL, "content" character varying NOT NULL, "chat_id" character varying NOT NULL, "user_id" character varying NOT NULL, CONSTRAINT "PK_ba01f0a3e0123651915008bc578" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "chat" ("id" character varying NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "name" character varying NOT NULL, "user_id" character varying NOT NULL, "organisation_id" character varying NOT NULL, CONSTRAINT "PK_9d0b2ba74336710fd31154738a5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "o_auth" ALTER COLUMN "last_sync" SET DEFAULT NULL`);
        await queryRunner.query(`ALTER TABLE "message" ADD CONSTRAINT "FK_859ffc7f95098efb4d84d50c632" FOREIGN KEY ("chat_id") REFERENCES "chat"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "message" ADD CONSTRAINT "FK_54ce30caeb3f33d68398ea10376" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "chat" ADD CONSTRAINT "FK_15d83eb496fd7bec7368b30dbf3" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "chat" ADD CONSTRAINT "FK_a53b598d6e2f0af3b3f66110645" FOREIGN KEY ("organisation_id") REFERENCES "organisation"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "chat" DROP CONSTRAINT "FK_a53b598d6e2f0af3b3f66110645"`);
        await queryRunner.query(`ALTER TABLE "chat" DROP CONSTRAINT "FK_15d83eb496fd7bec7368b30dbf3"`);
        await queryRunner.query(`ALTER TABLE "message" DROP CONSTRAINT "FK_54ce30caeb3f33d68398ea10376"`);
        await queryRunner.query(`ALTER TABLE "message" DROP CONSTRAINT "FK_859ffc7f95098efb4d84d50c632"`);
        await queryRunner.query(`ALTER TABLE "o_auth" ALTER COLUMN "last_sync" DROP DEFAULT`);
        await queryRunner.query(`DROP TABLE "chat"`);
        await queryRunner.query(`DROP TABLE "message"`);
        await queryRunner.query(`DROP TYPE "public"."message_role_enum"`);
        await queryRunner.query(`ALTER TABLE "event" ADD CONSTRAINT "FK_3b3b1b8362ad7c552578ddf8d53" FOREIGN KEY ("component_id") REFERENCES "component"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
