import { MigrationInterface, QueryRunner } from "typeorm";

export class AddComponentEntity1706843118749 implements MigrationInterface {
    name = 'AddComponentEntity1706843118749'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."component_type_enum" AS ENUM('service', 'application', 'ui')`);
        await queryRunner.query(`CREATE TABLE "component" ("id" character varying NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "type" "public"."component_type_enum", "name" character varying NOT NULL, "description" character varying, "organisation_id" character varying, CONSTRAINT "PK_c084eba2d3b157314de79135f09" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "component" ADD CONSTRAINT "FK_42d487305c32894f346803abb87" FOREIGN KEY ("organisation_id") REFERENCES "organisation"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "component" DROP CONSTRAINT "FK_42d487305c32894f346803abb87"`);
        await queryRunner.query(`DROP TABLE "component"`);
        await queryRunner.query(`DROP TYPE "public"."component_type_enum"`);
    }

}
