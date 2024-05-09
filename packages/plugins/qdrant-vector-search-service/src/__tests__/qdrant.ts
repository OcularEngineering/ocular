import { AppNameDefinitions, IVectorDB } from "@ocular/types";
import qdrantService from "../services/qdrant";
import { QdrantClient } from "@qdrant/js-client-rest";

// This test assumes that a Qdrant service is running in Docker localhost:6333.
// To run the service, check the instructions in the Developer.md file.

describe("qdrantService", () => {
  let service: IVectorDB;
  beforeEach(async () => {
    service = new qdrantService(
      {},
      { quadrant_db_url: "http://localhost:6333", embedding_size: 3 }
    );
    // Create a Search Index
    await service.createIndex("OcularTestIndex");

    // Create Mock Testing Documens
    const mockDocuments = [
      {
        chunkId: 0,
        organisationId: "3e6c4e66-7b8a-4b2c-9e4f-4f4e6def971c",
        documentId: "document1",
        title: "Confluence Indexed Document",
        titleEmbeddings: [1, 2, 3],
        source: AppNameDefinitions.CONFLUENCE,
        content: "Confluence Chunk 0 Content",
        contentEmbeddings: [1, 2, 3],
        tokens: 33,
        metadata: {},
        offsets: {},
        updatedAt: new Date("2000-01-01"),
      },
      {
        chunkId: 1,
        organisationId: "3e6c4e66-7b8a-4b2c-9e4f-4f4e6def971c",
        documentId: "document1",
        title: "Confluence Indexed Document",
        titleEmbeddings: [1, 2, 3],
        source: AppNameDefinitions.CONFLUENCE,
        content: "Confluence Chunk 1 Content",
        contentEmbeddings: [1, 2, 3],
        tokens: 33,
        metadata: {},
        offsets: {},
        updatedAt: new Date("2000-01-01"),
      },
      {
        chunkId: 0,
        organisationId: "3e6c4e66-7b8a-4b2c-9e4f-4f4e6def971g",
        documentId: "document2",
        title: "Google Drive Indexed Document",
        titleEmbeddings: [1, 2, 3],
        source: AppNameDefinitions.GOOGLEDRIVE,
        content: "Google Drive Chunk 1 Content",
        tokens: 33,
        contentEmbeddings: [1, 2, 3],
        metadata: {},
        updatedAt: new Date("2010-01-01"),
      },
      {
        chunkId: 1,
        organisationId: "3e6c4e66-7b8a-4b2c-9e4f-4f4e6def971g",
        documentId: "document2",
        title: "Google Drive Indexed Document",
        titleEmbeddings: [1, 2, 3],
        source: AppNameDefinitions.GOOGLEDRIVE,
        content: "Google Drive Chunk 2 Content",
        tokens: 33,
        contentEmbeddings: [1, 2, 3],
        metadata: {},
        updatedAt: new Date("2010-01-01"),
      },
      {
        chunkId: 0,
        organisationId: "3e6c4e66-7b8a-4b2c-9e4f-4f4e6def971j",
        documentId: "document3",
        title: "Notion Chunk 0 Indexed Document",
        titleEmbeddings: [1, 2, 3],
        source: AppNameDefinitions.NOTION,
        content: "Notion Content",
        tokens: 33,
        contentEmbeddings: [1, 2, 3],
        metadata: {},
        updatedAt: new Date("2010-01-01"),
      },
      {
        chunkId: 1,
        organisationId: "3e6c4e66-7b8a-4b2c-9e4f-4f4e6def971j",
        documentId: "document3",
        title: "Notion Chunk 1 Indexed Document",
        titleEmbeddings: [1, 2, 3],
        source: AppNameDefinitions.NOTION,
        content: "Notion Content",
        tokens: 33,
        contentEmbeddings: [1, 2, 3],
        metadata: {},
        updatedAt: new Date("2020-01-01"),
      },
    ];

    await service.addDocuments("OcularTestIndex", mockDocuments);
  });

  it("Should Search Index And Return All Results", async () => {
    const searchResults = {
      hits: [
        {
          documentId: "document3",
          snippets: [
            { content: "Notion Content", score: 0.9999999 },
            { content: "Notion Content", score: 0.9999999 },
          ],
        },
        {
          documentId: "document1",
          snippets: [
            { content: "Confluence Chunk 1 Content", score: 0.9999999 },
            { content: "Confluence Chunk 0 Content", score: 0.9999999 },
          ],
        },
        {
          documentId: "document2",
          snippets: [
            { content: "Google Drive Chunk 2 Content", score: 0.9999999 },
            { content: "Google Drive Chunk 1 Content", score: 0.9999999 },
          ],
        },
      ],
    };
    const mockVector = [1, 2, 3];
    const result = await service.searchDocuments("OcularTestIndex", mockVector);

    // Sort the results by content for comparison
    expect(sortHitsByContent(searchResults.hits)).toEqual(
      sortHitsByContent(result.hits)
    );

    await service.deleteIndex("OcularTestIndex");
  });

  it("Filter By Number Of Results", async () => {
    const mockVector = [1, 2, 3];
    const result1 = await service.searchDocuments(
      "OcularTestIndex",
      mockVector,
      { top: 1 }
    );
    expect(result1.hits.length).toEqual(1);
    const result2 = await service.searchDocuments(
      "OcularTestIndex",
      mockVector,
      { top: 2 }
    );
    expect(result2.hits.length).toEqual(2);
    const result3 = await service.searchDocuments(
      "OcularTestIndex",
      mockVector,
      { top: 3 }
    );
    expect(result3.hits.length).toEqual(3);
  });

  it("Filter By One Source", async () => {
    const searchResults = [
      {
        documentId: "document2",
        snippets: [
          {
            content: "Google Drive Chunk 1 Content",
            score: 0.9999999,
          },
          {
            content: "Google Drive Chunk 2 Content",
            score: 0.9999999,
          },
        ],
      },
    ];
    const mockVector = [1, 2, 3];
    // One GitHub Source
    const result = await service.searchDocuments(
      "OcularTestIndex",
      mockVector,
      { sources: [AppNameDefinitions.GOOGLEDRIVE] }
    );
    console.log(result);
    expect(result.hits).toEqual(searchResults);
    await service.deleteIndex("OcularTestIndex");
  });

  it("Filter By Two Sources", async () => {
    const searchResults = [
      {
        documentId: "document3",
        snippets: [
          {
            content: "Notion Content",
            score: 0.9999999,
          },
          {
            content: "Notion Content",
            score: 0.9999999,
          },
        ],
      },
      {
        documentId: "document1",
        snippets: [
          {
            content: "Confluence Chunk 0 Content",
            score: 0.9999999,
          },
          {
            content: "Confluence Chunk 1 Content",
            score: 0.9999999,
          },
        ],
      },
    ];
    const mockVector = [1, 2, 3];
    // One GitHub Source
    const result = await service.searchDocuments(
      "OcularTestIndex",
      mockVector,
      {
        sources: [AppNameDefinitions.CONFLUENCE, AppNameDefinitions.NOTION],
      }
    );

    // Sort the results by content for comparison
    expect(sortHitsByContent(searchResults)).toEqual(
      sortHitsByContent(result.hits)
    );

    await service.deleteIndex("OcularTestIndex");
  });

  it("Should Filter By Organisation", async () => {
    const searchResults = {
      hits: [
        {
          documentId: "document3",
          snippets: [
            { content: "Notion Content", score: 0.9999999 },
            { content: "Notion Content", score: 0.9999999 },
          ],
        },
      ],
    };
    const mockVector = [1, 2, 3];
    const result = await service.searchDocuments(
      "OcularTestIndex",
      mockVector,
      { top: 2, organisation_id: "3e6c4e66-7b8a-4b2c-9e4f-4f4e6def971j" }
    );

    // Sort the results by content for comparison
    expect(sortHitsByContent(searchResults.hits)).toEqual(
      sortHitsByContent(result.hits)
    );

    await service.deleteIndex("OcularTestIndex");
  });

  it("Should Return Result For Empty Sources Array", async () => {
    const mockVector = [1, 2, 3];
    const result = await service.searchDocuments(
      "OcularTestIndex",
      mockVector,
      { sources: [] }
    );

    // Sort the results by content for comparison
    expect(result.hits.length).toEqual(3);

    await service.deleteIndex("OcularTestIndex");
  });

  it("Search Document Chunks", async () => {
    const searchResults = [
      {
        score: 0.9999999,
        content: "Google Drive Chunk 2 Content",
        documentId: "document2",
        organisationId: "3e6c4e66-7b8a-4b2c-9e4f-4f4e6def971g",
        chunkId: 1,
        source: "google-drive",
        title: "Google Drive Indexed Document",
        metadata: {},
      },
      {
        score: 0.9999999,
        content: "Confluence Chunk 0 Content",
        documentId: "document1",
        organisationId: "3e6c4e66-7b8a-4b2c-9e4f-4f4e6def971c",
        chunkId: 0,
        source: "confluence",
        title: "Confluence Indexed Document",
        metadata: {},
      },
      {
        score: 0.9999999,
        content: "Google Drive Chunk 1 Content",
        documentId: "document2",
        organisationId: "3e6c4e66-7b8a-4b2c-9e4f-4f4e6def971g",
        chunkId: 0,
        source: "google-drive",
        title: "Google Drive Indexed Document",
        metadata: {},
      },
    ];
    const mockVector = [1, 2, 3];
    const result = await service.searchDocumentChunks(
      "OcularTestIndex",
      mockVector
    );

    // Sort the results by content for comparison
    expect(result).toEqual(searchResults);

    await service.deleteIndex("OcularTestIndex");
  });

  it("Filter Documents By Date And Time", async () => {
    const searchResults = {
      hits: [
        {
          documentId: "document3",
          snippets: [
            {
              content: "Notion Content",
              score: 0.9999999,
              updatedAt: "2020-01-01T00:00:00.000Z",
            },
          ],
        },
      ],
    };
    const mockVector = [1, 2, 3];
    const result = await service.searchDocuments(
      "OcularTestIndex",
      mockVector,
      {
        date: {
          from: "2019-01-01",
          to: "2024-01-01",
        },
      }
    );

    // Sort the results by content for comparison
    expect(sortHitsByContent(searchResults.hits)).toEqual(
      sortHitsByContent(result.hits)
    );

    await service.deleteIndex("OcularTestIndex");
  });

  it("Filter Chunks By Date And Time", async () => {
    const searchResults = [
      {
        chunkId: 1,
        score: 0.9999999,
        organisationId: "3e6c4e66-7b8a-4b2c-9e4f-4f4e6def971j",
        documentId: "document3",
        title: "Notion Chunk 1 Indexed Document",
        source: AppNameDefinitions.NOTION,
        content: "Notion Content",
        metadata: {},
        updatedAt: "2020-01-01T00:00:00.000Z",
      },
    ];
    const mockVector = [1, 2, 3];
    const result = await service.searchDocumentChunks(
      "OcularTestIndex",
      mockVector,
      {
        date: {
          from: "2019-01-01",
          to: "2024-01-01",
        },
      }
    );

    // Sort the results by content for comparison
    expect(result).toEqual(searchResults);

    await service.deleteIndex("OcularTestIndex");
  });
});
// Sort the results by content for comparison
function sortHitsByContent(hits) {
  const sortFunction = (a, b) => a.content.localeCompare(b.content);
  return hits.map((hit) => ({
    ...hit,
    snippets: hit.snippets.sort(sortFunction),
  }));
}
