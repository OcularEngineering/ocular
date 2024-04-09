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
   git clone your-forked-repo
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

### Start Backend

1. Build repo with turbo.

```sh
   turbo build  # install dependencies
```

2. Copy the example `.env.local.example` to `.env.local`

```sh
   cp packages/ocular/.env.local.example packages/ocular/.env
```

3. Navigate into core-backend "packages/ocular" and uncomment "apps" and "plugins" to activate apps and plugins in Ocular.

4. Configure .env with app and plugin secrets of the apps added above.

5. After that start the backend.

```sh
   npm run start # start all the applications
```

### Start UI

1. Install the dependencies in the root of the repo.

   ```sh
   npm install # install dependencies
   ```

2. Navigate to Ocular UI in "packages/ocular-ui".

3. After that you can run the apps simultaneously with the following.

```sh
   npm run dev # start all the applications
```

Then visit the following sites:

| Site                                                     | Directory      | Scope name | Description                                   | Local development server   |
| -------------------------------------------------------- | -------------- | ---------- | --------------------------------------------- | -------------------------- |
| [useocular.com/dashboard](https://useocular.com/dashboard) | `/packages/ocular-ui` | front-end    | Ocular UI (requires Docker, see below) | http://localhost:3001/create-account      |

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

## Running Docker for Ocular

To run Studio locally, you'll need to setup Docker in addition to your NextJS frontend.

#### Prerequsites

First, make sure you have the Docker installed on your device. You can download and install it from [here](https://docs.docker.com/get-docker/).

1. In the home directory, run docker.

   ```sh
   docker compose -f docker-compose.dev.yml up
   ```

This command initializes the containers specified in the `docker-compose.yml` file. It might take a few moments to complete, depending on your computer and internet connection.

Once the `docker compose up` process completes, you should have your local version of Ocular up and running within Docker containers. You can access it at `http://localhost:3001`.

Remember to keep the Docker application open as long as you're working with your local Ocular instance.

## Create a pull request

After making any changes, open a pull request. Once you submit your pull request, the Ocular team will review it with you.

Once your PR has been merged, you will be proudly listed as an Ocular contributor.

## Issue assignment

We don't have a process for assigning issues to contributors yet.

---

## Community channels

If you get stuck somewhere or have any questions, join our [Slack Workspace](https://join.slack.com/t/ocular-ai/shared_invite/zt-2g7ka0j1c-Tx~Q46MjplNma2Sk2Ruplw)!
