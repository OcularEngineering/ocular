import { OpenAI } from "openai";
import OpenAIService from "../services/open-ai";
import dotenv from "dotenv";
dotenv.config({ path: "../../ocular/.env.dev" });

describe("OpenAIService", () => {
  let service;

  beforeEach(() => {
    service = new OpenAIService(
      {
        rateLimiterService: {
          getRequestQueue: jest.fn().mockReturnValue({
            removeTokens: jest.fn(),
          }),
        },
      },
      {
        embedding_model: process.env.OPEN_AI_EMBEDDING_MODEL,
        open_ai_key: process.env.OPEN_AI_KEY,
        chat_model: process.env.OPEN_AI_CHAT_MODEL,
      }
    );
  });

  // it("should create embeddings", async () => {
  //   const doc = { content: "t" };
  //   const embeddings = await service.createEmbeddings("test content");
  //   expect(embeddings).toEqual([1, 2, 3]);
  //   expect(OpenAI).toHaveBeenCalledWith({
  //     apiKey: "test-key",
  //     defaultQuery: { "api-version": "test-version" },
  //     defaultHeaders: { "api-key": "test-key" },
  //     baseURL: "test-endpoint/openai/deployments/test-deployment",
  //   });
  //   expect(service.openai_.embeddings.create).toHaveBeenCalledWith({
  //     input: "test content",
  //     model: "test-model",
  //   });
  // });

  // it("should return empty array if doc content is not provided", async () => {
  //   const doc = {};
  //   const embeddings = await service.createEmbeddings("test");
  //   expect(embeddings).toEqual([]);
  // });

  it("should complete chat with stream", async () => {
    const messages = [
      { role: "system", content: "You are a helpful assistant." },
      {
        role: "user",
        content:
          'Translate the following English text to French: "Hello, how are you?"',
      },
    ];
    const stream = service.completeChatWithStreaming(messages);
    let result = "";
    for await (const chunk of stream) {
      result += chunk;
    }
    expect(result).toEqual('"Bonjour, comment vas-tu ?"');
  });
});
