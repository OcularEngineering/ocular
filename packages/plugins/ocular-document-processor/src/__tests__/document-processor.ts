import { IndexableDocument, IndexableDocChunk, AppNameDefinitions } from "@ocular/types";
import DocumentProcessor from '../document-processor';
import fs from 'fs';
import path from 'path';

let filePath = path.join(__dirname, 'file_content.txt'); // replace with your file path

describe('DocumentProcessor', () => {
  let processor: DocumentProcessor;

  beforeEach(() => {
    processor = new DocumentProcessor();
  });

  it('should chunk an indexable document correctly', () => {
    const document: IndexableDocument = {
      id: '1',
      organisationId: 'org1',
      title: 'Test Document',
      content : fs.readFileSync(filePath, 'utf8'),
      source: AppNameDefinitions.TEST,
      metadata: 'metadata',
      location: 'http://example.com/test-document',
      updatedAt: new Date(),
    };

    const expectedChunks: IndexableDocChunk[] = [
      {
        id:`source-${document.id}-section-1045`,
        organisationId: document.organisationId,
        sourceDocId: document.id,
        title: document.title,
        source: AppNameDefinitions.TEST,
        content:"\"Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical literature, discovered the undoubtable source. Lorem Ipsum comes from sections 1.10.32 and 1.10.33 of de Finibus Bonorum et Malorum (The Extremes of Good and Evil) by Cicero, written in 45 BC. This book is a treatise on the theory of ethics, very popular during the Renaissance. The first line of Lorem Ipsum, Lorem ipsum dolor sit amet.., comes from a line in section 1.10.32. The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested. Sections 1.10.32 and 1.10.33 from de Finibus Bonorum et Malorum by Cicero are also reproduced in their exact original form, accompanied by English versions from the 1914 translation by H." ,
        metadata: 'metadata',
        updatedAt: document.updatedAt,
        location: document.location,
      },
      {
        id:`source-${document.id}-section-1055`,
        organisationId: document.organisationId,
        sourceDocId: document.id,
        title: document.title,
        source: AppNameDefinitions.TEST,
        content:"33 from de Finibus Bonorum et Malorum by Cicero are also reproduced in their exact original form, accompanied by English versions from the 1914 translation by H. Rackham.\"",
        metadata: 'metadata',
        updatedAt: document.updatedAt,
        location: document.location,
      },
      {
        id: 'source-1-section-1055',
        organisationId: 'org1',
        sourceDocId: '1',
        title: 'Test Document',
        source: undefined,
        content: 'their exact original form, accompanied by English versions from the 1914 translation by H. Rackham."',
        metadata: 'metadata',
        updatedAt: document.updatedAt,
        location: 'http://example.com/test-document'
      }
    ];
    const chunks = processor.chunkIndexableDocument(document);
    expect(chunks).toEqual(expectedChunks);
  });
});