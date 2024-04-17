import { AppNameDefinitions, IVectorDB } from '@ocular/types';
import qdrantService from '../services/qdrant';
import { QdrantClient } from '@qdrant/js-client-rest';

// This test assumes that a Qdrant service is running in Docker localhost:6333.
// To run the service, check the instructions in the Developer.md file.

describe('qdrantService', () => {
  let service: IVectorDB;
  beforeEach( async () => {
    service = new qdrantService({}, { quadrant_db_url: 'http://localhost:6333', embedding_size: 3 });
       // Create a Search Index
       await service.createIndex("OcularTestIndex")

       // Create Mock Testing Documens
       const mockDocuments = [
         {
         chunkId: 0,
         organisationId: '3e6c4e66-7b8a-4b2c-9e4f-4f4e6def971a',
         documentId: '3e6c4e66-7b8a-4b2c-9e4f-4f4e6def971f',
         title: 'Asana Indexed Document',
         titleEmbeddings:  [1, 2, 3],
         source: AppNameDefinitions.ASANA,
         content: 'Asana Content',
         contentEmbeddings:  [1, 2, 3],
         tokens: 33,
         metadata: {},
         offsets:{},
         updatedAt: new Date("2024-03-27T09:37:44.474Z"),
       },
       {
         chunkId: 1,
         organisationId: '3e6c4e66-7b8a-4b2c-9e4f-4f4e6def971c',
         documentId: '3e6c4e66-7b8a-4b2c-9e4f-4f4e6def971f',
         title: 'Confluence Indexed Document',
         titleEmbeddings:  [1, 2, 3],
         source: AppNameDefinitions.CONFLUENCE,
         content: 'Confluence Content',
         contentEmbeddings:  [1, 2, 3],
         tokens: 33,
         metadata: {},
         offsets:{},
         updatedAt: new Date("2024-03-27T09:37:44.474Z"),
       },
       {
         chunkId: 2,
         organisationId: '3e6c4e66-7b8a-4b2c-9e4f-4f4e6def971gg',
         documentId: '3e6c4e66-7b8a-4b2c-9e4f-4f4e6def971f',
         title: 'Github Indexed Document',
         titleEmbeddings:  [1, 2, 3],
         source: AppNameDefinitions.GITHUB,
         content: 'Github Content',
         tokens: 33,
         contentEmbeddings:  [1, 2, 3],
         metadata: {},
         offsets:{},
         updatedAt: new Date("2024-03-27T09:37:44.474Z"),
       },
       {
         chunkId: 3,
         organisationId: '3e6c4e66-7b8a-4b2c-9e4f-4f4e6def971g',
         documentId: '3e6c4e66-7b8a-4b2c-9e4f-4f4e6def971f',
         title: 'Google Drive Indexed Document',
         titleEmbeddings:  [1, 2, 3],
         source: AppNameDefinitions.GOOGLEDRIVE,
         content: 'Google Drive Content',
         tokens: 33,
         contentEmbeddings:  [1, 2, 3],
         metadata: {},
         updatedAt: new Date("2024-03-27T09:37:44.474Z"),
       },
       {
         chunkId: 4,
         organisationId: '3e6c4e66-7b8a-4b2c-9e4f-4f4e6def971j',
         documentId: '3e6c4e66-7b8a-4b2c-9e4f-4f4e6def971f',
         title: 'Jira Indexed Document',
         titleEmbeddings:  [1, 2, 3],
         source: AppNameDefinitions.JIRA,
         content: 'Jira Content',
         tokens: 33,
         contentEmbeddings:  [1, 2, 3],
         metadata: {},
         updatedAt: new Date("2024-03-27T09:37:44.474Z"),
       },
       {
         chunkId: 5,
         organisationId: '3e6c4e66-7b8a-4b2c-9e4f-4f4e6def971n',
         documentId: '3e6c4e66-7b8a-4b2c-9e4f-4f4e6def971f',
         title: 'Notion Indexed Document',
         titleEmbeddings:  [1, 2, 3],
         source: AppNameDefinitions.NOTION,
         content: 'Notion Content',
         tokens: 33,
         contentEmbeddings:  [1, 2, 3],
         metadata: {},
         updatedAt: new Date("2024-03-27T09:37:44.474Z"),
       },
     ];
  
     await service.addDocuments("OcularTestIndex",mockDocuments);
  });

  it('Should Search Index And Return All Results', async () => {
    // Create Mock Testing Documens
    const searchResultDocuments = [
      {
        chunkId: 2,
        organisationId: '3e6c4e66-7b8a-4b2c-9e4f-4f4e6def971gg',
        documentId: '3e6c4e66-7b8a-4b2c-9e4f-4f4e6def971f',
        title: 'Github Indexed Document',
        titleEmbeddings:  [1, 2, 3],
        source: AppNameDefinitions.GITHUB,
        content: 'Github Content',
        tokens: 33,
        contentEmbeddings:  [1, 2, 3],
        metadata: {},
        offsets:{},
        updatedAt: new Date("2024-03-27T09:37:44.474Z"),
      },
      {
        chunkId: 3,
        organisationId: '3e6c4e66-7b8a-4b2c-9e4f-4f4e6def971g',
        documentId: '3e6c4e66-7b8a-4b2c-9e4f-4f4e6def971f',
        title: 'Google Drive Indexed Document',
        titleEmbeddings:  [1, 2, 3],
        source: AppNameDefinitions.GOOGLEDRIVE,
        content: 'Google Drive Content',
        tokens: 33,
        contentEmbeddings:  [1, 2, 3],
        metadata: {},
        updatedAt: new Date("2024-03-27T09:37:44.474Z"),
      },
      {
        chunkId: 5,
        organisationId: '3e6c4e66-7b8a-4b2c-9e4f-4f4e6def971n',
        documentId: '3e6c4e66-7b8a-4b2c-9e4f-4f4e6def971f',
        title: 'Notion Indexed Document',
        titleEmbeddings:  [1, 2, 3],
        source: AppNameDefinitions.NOTION,
        content: 'Notion Content',
        tokens: 33,
        contentEmbeddings:  [1, 2, 3],
        metadata: {},
        updatedAt: new Date("2024-03-27T09:37:44.474Z"),
      },
  ];
    const mockVector = [1, 2, 3];
    const result = await service.searchDocuments('OcularTestIndex', mockVector);
    expect(result.length).toEqual(searchResultDocuments.length);
    await service.deleteIndex("OcularTestIndex")
  })

  it('Filter By Number Of Results', async () => {
    const mockVector = [1, 2, 3];
    const result1 = await service.searchDocuments('OcularTestIndex', mockVector,{top: 1});
    expect(result1.length).toEqual(1);
    const result2 = await service.searchDocuments('OcularTestIndex', mockVector,{top: 2});
    expect(result2.length).toEqual(2);
    const result3 = await service.searchDocuments('OcularTestIndex', mockVector,{top: 3});
    expect(result3.length).toEqual(3);
  })


  it('Filter By One Source', async () => {
    const GitHubSourceDoc = [
      {
        chunkId: 2,
        organisationId: '3e6c4e66-7b8a-4b2c-9e4f-4f4e6def971gg',
        documentId: '3e6c4e66-7b8a-4b2c-9e4f-4f4e6def971f',
        title: 'Github Indexed Document',
        source: AppNameDefinitions.GITHUB,
        content: 'Github Content',
        metadata: {},
        updatedAt: new Date("2024-03-27T09:37:44.474Z"),
      },
    ]
    const mockVector = [1, 2, 3];
    // One GitHub Source
    const result = await service.searchDocuments('OcularTestIndex', mockVector, {sources: new Set([AppNameDefinitions.GITHUB])});
    expect(result).toEqual(GitHubSourceDoc);
    await service.deleteIndex("OcularTestIndex")
  })

  it('Filter By Two Sources', async () => {
    const DocsFromSources = [
      {
        chunkId: 5,
        organisationId: '3e6c4e66-7b8a-4b2c-9e4f-4f4e6def971n',
        documentId: '3e6c4e66-7b8a-4b2c-9e4f-4f4e6def971f',
        title: 'Notion Indexed Document',
        source: AppNameDefinitions.NOTION,
        content: 'Notion Content',
        metadata: {},
        updatedAt: new Date("2024-03-27T09:37:44.474Z"),
      },
      {
        chunkId: 0,
        organisationId: '3e6c4e66-7b8a-4b2c-9e4f-4f4e6def971a',
        documentId: '3e6c4e66-7b8a-4b2c-9e4f-4f4e6def971f',
        title: 'Asana Indexed Document',
        source: AppNameDefinitions.ASANA,
        content: 'Asana Content',
        metadata: {},
        updatedAt: new Date("2024-03-27T09:37:44.474Z"),
      },
    ]
    const mockVector = [1, 2, 3];
    // One GitHub Source
    const result = await service.searchDocuments('OcularTestIndex', mockVector, {sources: new Set([AppNameDefinitions.ASANA, AppNameDefinitions.NOTION])});
    expect(result).toHaveLength(DocsFromSources.length);
    result.forEach(item => {
      expect(DocsFromSources).toEqual(
        expect.arrayContaining([
          expect.objectContaining(item)
        ])
      );
    });
    await service.deleteIndex("OcularTestIndex")
  })
  })

  