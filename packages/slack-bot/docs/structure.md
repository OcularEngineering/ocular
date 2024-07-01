# Project structure

## `manifest.yml`

`manifest.yml` is a YAML-formatted configurations bundle for Slack apps. With a manifest, you can create an app with a pre-defined configuration, or adjust the configuration of an existing app.

## `app.js`

`app.js` is the entry point for the application and is the file you'll run using `node` to start the server. The project aims to keep this file as thin as possible, primarily using it as a way to route inbound requests.

## `/docs`

The folder contains all the documentation for the project, like this file.

## `/listeners`

Every incoming request to Tasks App is routed to a "listener". Inside this directory, we group each listener based on the Slack Platform feature used, so `/listeners/shortcuts` handles incoming [Shortcuts](https://api.slack.com/interactivity/shortcuts) requests, `/listeners/views` handles [View submissions](https://api.slack.com/reference/interaction-payloads/views#view_submission) and so on.

## `/user-interface`

All user interface in a Slack App is expressed using [Block Kit](https://api.slack.com/block-kit). This folder contains all the Block Kit code for the app. For ease of reading, Tasks App uses a community library called [Block Builder](https://github.com/raycharius/slack-block-builder/), but this isn't a requirement of Slack Apps. You're free to use a different library such as [JSX Slack](https://github.com/yhatt/jsx-slack), or even regular JSON. The Slack Platform endpoints consume blocks as JSON, so whichever approach you take, as long as it can output valid Block Kit JSON, will be fine.

## `/models`

To make it easier to switch between data store types, we use [Sequelize](https://sequelize.org/) to handle all the database interactions. By default we use SQLite to simplify local development, but any of the systems that Sequelize supports should work. The `/models` folder contains the structure of all the data objects used.

## `/migrations`

These are files related to the database migrations performed with Sequelize. These migrations should be the **only way** that the structure of the database is changed.