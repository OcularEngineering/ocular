# Running Docker for Ocular

To run Studio locally, you'll need to setup Docker in addition to your NextJS frontend.

## Prerequsites

First, make sure you have the Docker installed on your device. You can download and install it from [here](https://docs.docker.com/get-docker/).

1. In the home directory, run docker.

   ```sh
   docker compose -f docker-compose.dev.yml up
   ```

This command initializes the containers specified in the `docker-compose.yml` file. It might take a few moments to complete, depending on your computer and internet connection.

Once the `docker compose up` process completes, you should have your local version of Ocular up and running within Docker containers. You can access it at `http://localhost:3001`.

Remember to keep the Docker application open as long as you're working with your local Ocular instance.
