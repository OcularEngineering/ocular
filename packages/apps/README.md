# Steps to Add Apps to Ocular 🚀

## Instructions 📋

Ocular utilizes [OAuth 2.0](https://oauth.net/2/) for Authentication.

### 1. Set Up Your Environment

- Navigate to the root of the repository:
  ```sh
  cd packages/ocular
  ```
- Generate the `CLIENT_SECRET` and `CLIENT_ID`.
- Obtain the `AUTH_URL` along with the required `scopes`.

> 📝 **Note:** Add the `CLIENT_ID` and `CLIENT_SECRET` variables in `.env.local`.

### 2. Connect app to Occular

In `packages/ocular/core-config.js`, append the following to the `apps` array:

```javascript
const apps = [
  // Existing app configurations...
  {
    resolve: `appName`,
    options: {
      client_id: process.env.APP_CLIENT_ID,
      client_secret: process.env.APP_CLIENT_SECRET,
      scope: "openid email profile",
      redirect_uri: `${UI_CORS}/dashboard/marketplace/appName`,
    },
  },
];
```

## Naming Convention and Folder Structure 📁

Ensure your project adheres to the following structure for consistency and maintainability:

- `src/` - Contains source files.
  - `services/` - Service logic.
    - `[appName].ts` - Interacts with the app's API.
    - `oauth.ts` - Implements OAuth authentication logic.
  - `strategies/` - Strategy patterns and core logic.
    - `[appName].ts` - Batch job logic for the app.
- `package.json` - Manages npm package configurations.
- `.babelrc` - Babel compiler configuration.
- `.gitignore` - Lists files and directories to ignore in version control.
- `.npmignore` - Prevents certain files from being included when published to npm.
- `README.md` - Provides documentation, features, and essential information about the app.
- `tsconfig.json` - Configures TypeScript compiler options.

## Steps to Generate Migrations for the App 🚀

Follow these steps carefully to generate database migrations for your application.

## 1. Update App Name Definitions 📝

Add the app name in `AppNameDefinitions` in the file located at:
`packages/types/src/apps/definitions.ts`

## 2. Clear Docker Cache 🐳

Remove all cached images, containers, and volumes from Docker to ensure a clean environment.

## 3. Restart Docker and Containers 🔄

Restart Docker and all the associated containers.

```
docker-compose down
docker compose -f docker-compose.dev.yml up
```

## 4. Navigate to the Ocular Backend 📂

Change your working directory to the Ocular backend:

```sh
cd packages/ocular
```

## 5. Run the Migration Command 🛠️

Execute the migration command with an `identifier_name_for_migration`:

```sh
npm run typeorm migration:generate src/migrations/<identifier_name_for_migration>
```

## 6. Check the New Migration File 📄

A new migration file will be generated in packages/ocular/src/migration with the name identifier_name_for_migration.

🎉 Migration Process Complete!
Your database migrations are now complete and ready for use!

## Build the App 🛠️

To build your application, follow these steps:

1. At the root of the repository:

   ```sh
   turbo build
   ```

2. Navigate to the `packages/ocular` folder:
   ```sh
   cd packages/ocular
   ```
3. Start the docker
   ```sh
   docker compose -f docker-compose.dev.yml up
   ```
4. Start the backend:
   ```sh
   npm run start
   ```

## Community Channels 🌐

Reach out on Slack for further assistance:

- [Slack](https://join.slack.com/t/ocular-ai/shared_invite/zt-2g7ka0j1c-Tx~Q46MjplNma2Sk2Ruplw)

## License ©️

All rights reserved by [OccularAI](https://www.useocular.com/)

```

```
