# GoogleDrive

Intergrate Ocular with Azure Open AI Service.


## Features

- Allow Ocular To Communicate With Azure Open AI Service. Ocular uses an LLMService such as Azure Open AI to generate embeddings and perfom Chat completion.


## How to Install

1\. In `ocular/core-config.js` add the following at the end of the `plugins` array:

  ```js
  const plugins = [
    // ...
    {
      resolve: `azure-open-ai`,
      options: {
        open_ai_key: process.env.AZURE_OPEN_AI_KEY,
        open_ai_version: "2023-05-15",
        endpoint: process.env.AZURE_OPEN_AI_ENDPOINT,
        embedding_deployment_name: process.env.AZURE_OPEN_AI_EMBEDDER_DEPLOYMENT_NAME,
        embedding_model: process.env.AZURE_OPEN_AI_EMBEDDING_MODEL,
        chat_deployment_name: process.env.AZURE_OPEN_AI_CHAT_DEPLOYMENT_NAME,
        chat_model: process.env.AZURE_OPEN_AI_CHAT_MODEL,
      }
    },
  ]
  ```