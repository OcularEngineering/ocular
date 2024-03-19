# Secrets Management

Ocular uses Infisical to manage secrets within the core backend. For a quick start on how to install Infisical ClI check this [link](https://infisical.com/docs/documentation/getting-started/cli). As a DEV at Ocular you should have your Infisical account set up with the credientals provided to start developing on Ocualar.

After following the above instructions to log in to Infiscal.

# Start the CoreBackend

Start The Core Backend With Infisical As The Secrets Manager. It automatically injects the secrets into the BackEnd Process.

infisical run --env=dev turbo start

# CoreBackend Configuration


# Add or Modify DataBase Models
Generate Migrations
 infisical run --env=dev npm run typeorm migration:generate  src/migrations/adduserandorganisation

Build Source Migration
 npm run build

Run Migration
 infisical run --env=dev npm run typeorm migration:run

Revert 
 infisical run --env=dev npm run typeorm migration:revert


## Development
- Build The Whole Project Using Turbo And Infisical As A Secret Provider.
- turbo build

- Start the Backend Server
- cd packages/ocular
- infisical run --env=dev turbo start