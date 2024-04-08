import { MigrationInterface, QueryRunner } from "typeorm";

export class RefactorChatAndMessageModels1712536871567 implements MigrationInterface {
    name = 'RefactorChatAndMessageModels1712536871567'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "message" DROP CONSTRAINT "FK_54ce30caeb3f33d68398ea10376"`);
        await queryRunner.query(`ALTER TABLE "chat" DROP CONSTRAINT "FK_15d83eb496fd7bec7368b30dbf3"`);
        await queryRunner.query(`ALTER TABLE "chat" DROP CONSTRAINT "FK_a53b598d6e2f0af3b3f66110645"`);
        await queryRunner.query(`ALTER TABLE "o_auth" ALTER COLUMN "last_sync" SET DEFAULT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "o_auth" ALTER COLUMN "last_sync" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "chat" ADD CONSTRAINT "FK_a53b598d6e2f0af3b3f66110645" FOREIGN KEY ("organisation_id") REFERENCES "organisation"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "chat" ADD CONSTRAINT "FK_15d83eb496fd7bec7368b30dbf3" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "message" ADD CONSTRAINT "FK_54ce30caeb3f33d68398ea10376" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
