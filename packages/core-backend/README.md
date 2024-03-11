Build Project
npm run build

Start Project
npm run start



# Add or Modify DataBase Models
Generate Migrations
npm run typeorm migration:generate  src/migrations/adduserandorganisation

Build Source Migration
npm run build

Run Migration
npm run typeorm migration:run

Revert 
npm run typeorm migration:revert