# Secrets Management

Ocular uses Infisical to manage secrets within the core backend. For a quick start on how to install Infisical ClI check this [link](https://infisical.com/docs/documentation/getting-started/cli). As a DEV at Ocular you should have your Infisical account set up with the credientals provided to start developing on Ocualar.

After following the above instructions to log in to Infiscal.

# Start the Core Backend

Start The Core Backend With Infisical As The Secrets Manager. It automatically injects the secrets into the BackEnd Process.

infisical run -- npm run start

# 









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