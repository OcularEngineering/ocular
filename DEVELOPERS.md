# Developing Ocular

### Install dependencies

Install and configure the following dependencies on your machine to build Ocular.

- [Git](http://git-scm.com/)
- [Node.js v18.x (LTS)](http://nodejs.org)
- [npm](https://www.npmjs.com/) version 9.x.x
- [Docker](https://docs.docker.com/get-docker/) (to run studio locally)

## Local development

Ocular uses [Turborepo](https://turborepo.org/docs).

### Fork the repo

To contribute code to Ocular, you must fork the [Ocular repo](https://github.com/OcularEngineering/ocular).

### Clone the repo

1. Clone your GitHub forked repo:

   ```sh
   git clone your-forked-repo-ocular-repo

   ```

2. Go to the Ocular directory:

   ```sh
   cd ocular
   ```

### Install dependencies

1. Install the dependencies in the root of the repo.

```sh
   npm install # install dependencies
```

2. Install the dependencies in the root of the repo.

```sh
   npm install -g turbo # install dependencies
```

### Starting the Backend

1. Build repo with turbo.

   ```sh
      turbo build
   ```

2. Copy the example `env.dev.example` to `.env.dev`

   ```sh
      cp env.dev.example packages/ocular/.env.dev
   ```

3. Navigate to Ocular Dir

   ```sh
      cd packages/ocular/
   ```

4. Configure .env with app and plugin secrets of the apps and plugins you want to connect.

   - Azure Keys are **required** since they allow Ocular to connect to an LLM Service

   ```sh
      AZURE_OPEN_AI_KEY=
      AZURE_OPEN_AI_ENDPOINT=
      AZURE_OPEN_AI_EMBEDDER_DEPLOYMENT_NAME=
      AZURE_OPEN_AI_EMBEDDING_MODEL=
      AZURE_OPEN_AI_CHAT_DEPLOYMENT_NAME=
      AZURE_OPEN_AI_CHAT_MODEL=
   ```

   - Additional ApiKeys for other apps are optionnal but needed if you intend to connect Ocular to other apps.

5. Run Postgress DB + Redis + QDrant in Docker

```sh
   docker compose -f docker-compose.dev.yml up
```

6. Start the backend.

```sh
   npm run dev # start the backend
```

### Start UI

1. Navigate to Ocular UI in "packages/ocular-ui".

   ```sh
      cd packages/ocular/
   ```

2. Install front end dependencies with the following command.

   ```sh
      npm install --legacy-peer-deps # start all the applications
   ```

3. After that you can start the front end with the following.

   ```sh
      npm run dev
   ```

Then visit the following sites:

| Site                                   | Directory             | Scope name | Description | Local development server             |
| -------------------------------------- | --------------------- | ---------- | ----------- | ------------------------------------ |
| [useocular.com](https://useocular.com) | `/packages/ocular-ui` | front-end  | Ocular UI   | http://localhost:3001/create-account |

# Start Web UI for Docker Postgres Container 🐳

Follow these steps to get the web UI up and running for your Dockerized Postgres container.

## 1. Start the Docker Container

Use the command below to start your Docker container:

```bash
docker compose -f docker-compose.dev.yml up
```

## 2. Access the Web UI

Visit the following URL in your web browser to access the web UI:

🌐 http://localhost:5050/login?next=/browser/

## Here's the login page you should see:

![Login Page](/img/pg_signin.png)

## 3. Login Credentials

Use the following credentials to log in:

- Email: ocularpostgres@useocular.com
- Password: ocular

Get container ID for postgres

```sh
docker ps
```

Get container IP address using `postgres_container_id` which something looks like `17x.xx.x.x` at the bottom of the response

```sh
docker inspect <postgres_container_id>
```

## 4. Create a new server and connect to container

![server connection](/img/pg_connection.png)

🚀 Click save ! You should now be able to access the PostgreSQL management interface and manage your databases directly from your browser! |

#### Shared components

The monorepo components are under `/packages`:

- `/packages/apps`: Connectors To DataSources for Knowledge Indexing (Asana, Notion, GitHub etc)
- `/packages/ocular-ui`: UI Dashboard for Ocular.
- `/packages/ocular`: Backend for Ocular which Ingests Apps and Plugins.
- `/packages/plugins`: Plugin's That Allow Ocular to access services such as VectorDBS, LLMModels etc
- `/packages/types`: Shared data types shared across Ocular Modules
- `/packages/utils`: Shared Utils aross Ocular Modules

#### Installing packages

Installing a package with NPM workspaces requires you to add the `-w` flag to tell NPM which workspace you want to install into. Do not install dependencies in their local folder, install them from the route using the `-w` flag.

The format is: `npm install <package name> -w=<workspace to install in>`.

For example:

- `npm install react -w ocular-ui`: installs into `./packages/ocular-ui`
- `npm install react -w ocular`: installs into `./packages/ocular`

---

## Running All Of Ocular in Docker (Check the Ocular ReadMe)

---

## Create a pull request

After making any changes, open a pull request. Once you submit your pull request, the Ocular team will review it with you.

Once your PR has been merged, you will be proudly listed as an Ocular contributor.

## Issue assignment

We don't have a process for assigning issues to contributors yet.

---

## Community channels

If you get stuck somewhere or have any questions, join our [Slack Workspace](https://join.slack.com/t/ocular-ai/shared_invite/zt-2g7ka0j1c-Tx~Q46MjplNma2Sk2Ruplw)!
