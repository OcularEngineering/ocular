<h1 align="center">
  Ocular AI
</h1>

<h4 align="center">
  <a href="https://www.useocular.com/">Website</a>
</h4>

<p align="center">
  Building Blocks for Search Platforms.
</p>
<p align="center">
</p>

## Introduction

[Ocular](https://useocular.com) is a set of modules and tools that allow you to build rich, reliable, and performant Generative AI-Powered Search Platforms without the need to reinvent Search Architecture.

We're help to you build you spin up customized internal search in days not months.

<img src="/img/search.gif" width="100%" alt="Dashboard" />

## Features

- ** Google Like Search Interface - Find what you need.
- ** App MarketPlace - Connect to all of your favorite Apps.
- ** Custom Connectors - Build your own connectors to propeitary data sources.
- ** Customizable Modular Infrastructure - Bring your own custom LLM's, Vector DB and more into Ocular.
- ** Governance Engine - Role Based Access Control, Audit Logs etc.

## Open-source vs Paid

Repo is under [Elastic License 2.0 (ELv2)](https://github.com/OcularEngineering/ocular/blob/main/LICENSE).

If you are interested in managed Ocular Cloud of self-hosted Enterprise Offering [book a meeting with us](https://calendly.com/louis-murerwa):

## Getting started

## Running Ocular in Docker

To run Ocular locally, you'll need to setup Docker in addition to Ocular.

### Prerequsites

First, make sure you have the Docker installed on your device. You can download and install it from [here](https://docs.docker.com/get-docker/).

1. Clone the Ocular directory.

   ```sh
   git clone https://github.com/OcularEngineering/ocular.git
   ```

2. Navigate to Ocular Dir

   ```sh
    cd ocular
   ```

3. In the home directory, open `env.local.example` add the required env variables

    - <u>Required Keys</u>

      -  Open AI Keys (Azure|Open AI) - To run Ocular **an LLM provider must be setup in the backend** . By default Azure Open AI is the LLM Provider for Ocular so please add the Azure Open AI keys in `env.local`.
      - Support for Open AI is coming soon!
  
    - <u>Optional Keys</u>
      - Apps (Gmail|GoogleDrive|Asana|GitHub etc) - To Index Documents from Apps the Api keys have to be set up in the `env.local` for that specific app. Please read our docs on how to set up each app.

4. Copy the example `env.local.example` to `.env.local`

   ```sh
      cp env.local.example packages/ocular/.env.local
   ```

5. Run Docker.

   ```sh
   docker compose -f docker-compose.local.yml up
   ```

This command initializes the containers specified in the `docker-compose.local.yml` file. It might take a few moments to complete, depending on your computer and internet connection.

Once the `docker compose` process completes, you should have your local version of Ocular up and running within Docker containers. You can access it at `http://localhost:3001`.

Remember to keep the Docker application open as long as you're working with your local Ocular instance.

## Contributing

We love contributions. Check out our guide to see how to [get started](https://github.com/OcularEngineering/ocular/blob/main/CONTRIBUTING.md).

Not sure where to get started? You can:

- Join our <a href="https://join.slack.com/t/ocular-ai/shared_invite/zt-2g7ka0j1c-Tx~Q46MjplNma2Sk2Ruplw">Slack</a>, and ask us any questions there.
