import { MigrationInterface, QueryRunner } from "typeorm";

export class Modifybatchjob1708399215152 implements MigrationInterface {
    name = 'Modifybatchjob1708399215152'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "batch_job" DROP CONSTRAINT "FK_cdf30493ba1c9ef207e1e80c10a"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "batch_job" ADD CONSTRAINT "FK_cdf30493ba1c9ef207e1e80c10a" FOREIGN KEY ("created_by") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
