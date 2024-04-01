import { AppNameDefinitions, IVectorDB } from '@ocular/types';
import qdrantService from '../services/qdrant';
import { QdrantClient } from '@qdrant/js-client-rest';

describe('qdrantService', () => {
  let service: IVectorDB;
  beforeEach(() => {
    service = new qdrantService({}, { quadrant_db_url: 'http://localhost:6333', embedding_size: 3 });
  });



  it('should add a document', async () => {
    await service.createIndex("Ocular")
    const mockDoc = [{
      chunkId: 0,
      organisationId: '3e6c4e66-7b8a-4b2c-9e4f-4f4e6def971f',
      documentId: '3e6c4e66-7b8a-4b2c-9e4f-4f4e6def971f',
      title: 'Design For Adding Backend To Ocular',
      titleEmbeddings:  [1, 2, 3],
      source: AppNameDefinitions.ASANA,
      content: 'content',
      contentEmbeddings:  [1, 2, 3],
      metadata: {},
      offsets:{},
      updatedAt: new Date("2024-03-27T09:37:44.474Z"),
    }];

    const resultDoc = {
      ai_content: "",
      query: "",
      docs: [{
        chunkId: 0,
        organisationId: '3e6c4e66-7b8a-4b2c-9e4f-4f4e6def971f',
        documentId: '3e6c4e66-7b8a-4b2c-9e4f-4f4e6def971f',
        title: 'Design For Adding Backend To Ocular',
        source: AppNameDefinitions.ASANA,
        content: 'content',
        metadata: {},
        offsets:{},
        updatedAt: "2024-03-27T09:37:44.474Z",
    }]
   };

    await service.addDocuments("Ocular",mockDoc);

    const mockVector = [1, 2, 3];
    const result = await service.searchDocuments('Ocular', mockVector);
    expect(result).toEqual(resultDoc);
    await service.deleteIndex("Ocular")
  })})

  