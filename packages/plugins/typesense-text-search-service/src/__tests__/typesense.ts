import { AppNameDefinitions, ISearchService } from '@ocular/types';
import typesenseService from '../services/typesense';
import { QdrantClient } from '@qdrant/js-client-rest';

describe('typesenseService ', () => {
  let service: ISearchService;
  beforeEach(() => {
    service = new typesenseService({},{});
  });


  it('should add a document', async () => {
    const mockDoc = [{
      id: '3e6c4e66-7b8a-4b2c-9e4f-4f4e6def971f',
      organisationId: 'org1',
      sourceDocId: "sourceDocId",
      title: 'title',
      titleVector:  [1, 2, 3],
      source: AppNameDefinitions.ASANA,
      content: 'content',
      contentVector:  [1, 2, 3],
      metadata: "",
      location: "website",
      updatedAt: new Date("2024-03-27T09:37:44.474Z"),
    }];

    const resultDoc = [{
      id: '3e6c4e66-7b8a-4b2c-9e4f-4f4e6def971f',
      organisationId: 'org1',
      sourceDocId: "sourceDocId",
      title: 'title',
      source: AppNameDefinitions.ASANA,
      content: 'content',
      metadata: "",
      location: "website",
      updatedAt: 1711532264474,
    }];

    await service.addDocuments("org1", mockDoc);

    const mockVector = [1, 2, 3];
    const result = await service.search("org1", "content");
    expect(result).toEqual(resultDoc);
  })})