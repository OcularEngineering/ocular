<br>
<br>
<div align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="packages\ocular-ui\public\ocular-logo-official.svg">
    <img alt="Ocular Logo" src="packages\ocular-ui\public\ocular-logo-official.svg" width="40%">
  </picture>
<h2>✨ ChatGPT meets Google Search ✨</h2>
</div>

<br>

<div align="center">

[![License](https://img.shields.io/badge/Elastic-License--2.0-blue)](https://github.com/OcularEngineering/ocular?tab=License-1-ov-file)
[![Issues](https://img.shields.io/github/issues/OcularEngineering/ocular)](https://github.com/OcularEngineering/ocular/issues)

<br>

<a href='https://www.ycombinator.com/launches/KYi-ocular-ai-bringing-enterprise-search-gen-ai-and-actions-to-the-workplace' target="_blank"><img src='https://www.ycombinator.com/launches/KYi-ocular-ai-bringing-enterprise-search-gen-ai-and-actions-to-the-workplace/upvote_embed.svg' alt='Launch YC: Ocular AI - Bringing enterprise search, gen AI, and actions to the workplace' alt="Ocular - Dev&#0032;environment&#0032;manager&#0032;that&#0032;makes&#0032;you&#0032;2x&#0032;more&#0032;productive | Product Hunt" style="width: 250px; height: 54px;" width="250" height="54" ></a>
<a href="https://www.producthunt.com/posts/ocular-ai?embed=true&utm_source=badge-featured&utm_medium=badge&utm_souce=badge-ocular&#0045;ai" target="_blank"><img src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=443389&theme=light" alt="Ocular&#0032;AI - The&#0032;future&#0032;of&#0032;work&#0032;is&#0032;here | Product Hunt" style="width: 250px; height: 54px;" width="250" height="54" /></a>

</div>

<br>

<h1 align="center">The Open Core Enterprise Generative AI and Search Platform</h1>
<div align="center">
AI Powered Search and Chat for Companies - Think ChatGPT meets Google Search but powered by your data.
</div>
</br>

<p align="center">
<a href="https://x.com/OcularHQ">Twitter</a>
    |
  <a href="https://join.slack.com/t/ocular-ai/shared_invite/zt-2g7ka0j1c-Tx~Q46MjplNma2Sk2Ruplw">Join Our Slack</a>
    |
    <a href="https://github.com/OcularEngineering/ocular/issues/new?assignees=&labels=triage+needed%2Cbug&projects=&template=1_bug_report_form.yml&title=bug%3A+">Report Bug</a>
    |
    <a href="https://github.com/OcularEngineering/ocular/issues/new?assignees=&labels=enhancement&projects=&template=2_feature_request_form.yml&title=feat%3A+">Request Feature</a>
    
  </p>


## 🚀 Introduction

[Ocular](https://useocular.com) is a set of modules and tools that allow you to build rich, reliable, and performant Generative AI-Powered Search Platforms without the need to reinvent Search Architecture.

We're help to you build you spin up customized internal search in days not months.

<img src="/img/search.gif" width="100%" alt="Dashboard" />

## ✨ Features

- **Google Like Search Interface** - Find what you need.
- **App MarketPlace** - Connect to all of your favorite Apps.
- **Custom Connectors** - Build your own connectors to propeitary data sources.
- **Customizable Modular Infrastructure** - Bring your own custom LLM's, Vector DB and more into Ocular.
- **Governance Engine** - Role Based Access Control, Audit Logs etc.

## 🔓 Open-source vs Paid

Repo is under [Elastic License 2.0 (ELv2)](https://github.com/OcularEngineering/ocular/blob/main/LICENSE).

If you are interested in managed Ocular Cloud of self-hosted Enterprise Offering [book a meeting with us](https://calendly.com/louis-murerwa):

## Getting started

## 🐳 Running Ocular in Docker

To run Ocular locally, you'll need to setup Docker in addition to Ocular.

### Prerequsites

First, make sure you have the Docker installed on your device. You can download and install it from [here](https://docs.docker.com/get-docker/).

1. Clone the Ocular directory.

   ```sh
   git clone https://github.com/OcularEngineering/ocular.git && cd ocular
   ```

2. In the home directory, open `env.local` add the required OPEN AI env variables

   - <u>Required Keys</u>

     - Open AI Keys - To run Ocular **an LLM provider must be setup in the backend** . By default Open AI is the LLM Provider for Ocular so please add the Open AI keys in `env.local`.
     - Support for other LLM providers is coming soon!

   - <u>Optional Keys</u>
     - Apps (Gmail|GoogleDrive|Asana|GitHub etc) - To Index Documents from Apps the Api keys have to be set up in the `env.local` for that specific app. Please read our docs on how to set up each app.

3. Run Docker.

   ```sh
   docker compose -f docker-compose.local.yml up --build --force-recreate
   ```

This command initializes the containers specified in the `docker-compose.local.yml` file. It might take a few moments to complete, depending on your computer and internet connection.

Once the `docker compose` process completes, you should have your local version of Ocular up and running within Docker containers. You can access it at `http://localhost:3001/create-account`.

Remember to keep the Docker application open as long as you're working with your local Ocular instance.

## 🤝 Contributing

![Alt](https://repobeats.axiom.co/api/embed/560b0ec7f07b37781399c68379696b561669fb73.svg "Repobeats analytics image")

We love contributions. Check out our guide to see how to [get started](https://github.com/OcularEngineering/ocular/blob/main/CONTRIBUTING.md).

Not sure where to get started? You can:

- Join our <a href="https://join.slack.com/t/ocular-ai/shared_invite/zt-2g7ka0j1c-Tx~Q46MjplNma2Sk2Ruplw">Slack</a>, and ask us any questions there.

## 📚 Resources

- [Docs](https://docs.useocular.com) for comprehensive documentation and guides
- [Slack](https://join.slack.com/t/ocular-ai/shared_invite/zt-2g7ka0j1c-Tx~Q46MjplNma2Sk2Ruplw) for discussion with the community and Ocular team.
- [GitHub](https://github.com/OcularEngineering/ocular/issues) for code, issues, and pull requests
- Roadmap - Coming Soon

## ⭐Star History

[![Star History Chart](https://api.star-history.com/svg?repos=OcularEngineering/ocular&type=Date)](https://star-history.com/#OcularEngineering/ocular&Date)

## 💻Core Team

<table>
    <tr>
        <td align="center">
        <a href="https://github.com/louismurerwa">
            <img src="https://avatars.githubusercontent.com/u/35416595?v=4" width="100px;" alt=""/>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/MichaelMoyoMushabati">
            <img src="https://avatars.githubusercontent.com/u/73793231?v=4" width="100px;" alt=""/>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/Vivek-Lahole">
            <img src="https://avatars.githubusercontent.com/u/82323706?v=4" width="100px;" alt=""/>
        </a>
    </td>
    </tr>
</table>

## ✨Contributors

<a href="https://github.com/OcularEngineering/ocular/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=OcularEngineering/ocular" />
</a>
