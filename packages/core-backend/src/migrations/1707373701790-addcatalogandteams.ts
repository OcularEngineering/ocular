import { MigrationInterface, QueryRunner } from "typeorm";

export class Addcatalogandteams1707373701790 implements MigrationInterface {
    name = 'Addcatalogandteams1707373701790'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "team" ("id" character varying NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "name" character varying NOT NULL, "organisation_id" character varying, CONSTRAINT "PK_f57d8293406df4af348402e4b74" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "app" ("id" character varying NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "name" character varying NOT NULL, "install_url" character varying, "uninstall_url" character varying, CONSTRAINT "PK_9478629fc093d229df09e560aea" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_f36adbb7b096ceeb6f3e80ad14" ON "app" ("name") `);
        await queryRunner.query(`CREATE TABLE "o_auth" ("id" character varying NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "data" jsonb, "app_id" character varying, "organisation_id" character varying, CONSTRAINT "PK_10172120973beff91c304345fa3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "team_component" ("component_id" character varying NOT NULL, "team_id" character varying NOT NULL, CONSTRAINT "PK_e56ea991531bfa78d9dd927f259" PRIMARY KEY ("component_id", "team_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_08ca98b53417e04d2f03e0e47f" ON "team_component" ("component_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_ec88432c85e2a60bed862478be" ON "team_component" ("team_id") `);
        await queryRunner.query(`CREATE TABLE "team_users" ("team_id" character varying NOT NULL, "user_id" character varying NOT NULL, CONSTRAINT "PK_a2cfbfa301f3c455b359cc1d5db" PRIMARY KEY ("team_id", "user_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_91dc3f199d5f371dbe2d0ee7cb" ON "team_users" ("team_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_87bb13cad026c6b2a146b3683e" ON "team_users" ("user_id") `);
        await queryRunner.query(`ALTER TABLE "team" ADD CONSTRAINT "FK_f86f7d0f12e5ce185e6813b040d" FOREIGN KEY ("organisation_id") REFERENCES "organisation"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "o_auth" ADD CONSTRAINT "FK_ae53c1301373e783879493511ed" FOREIGN KEY ("app_id") REFERENCES "app"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "o_auth" ADD CONSTRAINT "FK_799055234a19c2dbe4f9af12bf3" FOREIGN KEY ("organisation_id") REFERENCES "organisation"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "team_component" ADD CONSTRAINT "FK_08ca98b53417e04d2f03e0e47f3" FOREIGN KEY ("component_id") REFERENCES "component"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "team_component" ADD CONSTRAINT "FK_ec88432c85e2a60bed862478be3" FOREIGN KEY ("team_id") REFERENCES "team"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "team_users" ADD CONSTRAINT "FK_91dc3f199d5f371dbe2d0ee7cb7" FOREIGN KEY ("team_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "team_users" ADD CONSTRAINT "FK_87bb13cad026c6b2a146b3683e9" FOREIGN KEY ("user_id") REFERENCES "team"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "team_users" DROP CONSTRAINT "FK_87bb13cad026c6b2a146b3683e9"`);
        await queryRunner.query(`ALTER TABLE "team_users" DROP CONSTRAINT "FK_91dc3f199d5f371dbe2d0ee7cb7"`);
        await queryRunner.query(`ALTER TABLE "team_component" DROP CONSTRAINT "FK_ec88432c85e2a60bed862478be3"`);
        await queryRunner.query(`ALTER TABLE "team_component" DROP CONSTRAINT "FK_08ca98b53417e04d2f03e0e47f3"`);
        await queryRunner.query(`ALTER TABLE "o_auth" DROP CONSTRAINT "FK_799055234a19c2dbe4f9af12bf3"`);
        await queryRunner.query(`ALTER TABLE "o_auth" DROP CONSTRAINT "FK_ae53c1301373e783879493511ed"`);
        await queryRunner.query(`ALTER TABLE "team" DROP CONSTRAINT "FK_f86f7d0f12e5ce185e6813b040d"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_87bb13cad026c6b2a146b3683e"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_91dc3f199d5f371dbe2d0ee7cb"`);
        await queryRunner.query(`DROP TABLE "team_users"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ec88432c85e2a60bed862478be"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_08ca98b53417e04d2f03e0e47f"`);
        await queryRunner.query(`DROP TABLE "team_component"`);
        await queryRunner.query(`DROP TABLE "o_auth"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_f36adbb7b096ceeb6f3e80ad14"`);
        await queryRunner.query(`DROP TABLE "app"`);
        await queryRunner.query(`DROP TABLE "team"`);
    }

}
