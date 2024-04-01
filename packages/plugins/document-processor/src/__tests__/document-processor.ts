import { IndexableDocument, IndexableDocChunk, AppNameDefinitions, AbstractDocumentProcesserService, Section } from "@ocular/types";
import documentProcessorService from '../services/document-processor';
import fs from 'fs';
import path from 'path';

// Get Sections From Dummy File
function getSections(): Section[]{
  let filePath = path.join(__dirname, 'file_content.txt');
  let fileContent = fs.readFileSync(filePath, 'utf8');
  let sections:Section[] = [];
  for (let i = 0; i < fileContent.length; i += 400) {
    let sectionContent = fileContent.slice(i, i + 400);
    sections.push({
      offset: i+sectionContent.length,
      content: sectionContent,
      link: `http://example.com/section${sections.length}`
    });
  }
  console.log(sections)
  return sections
}

describe('DocumentProcessor', () => {
  let processor:  AbstractDocumentProcesserService;
  beforeEach(() => {
    processor = new documentProcessorService({},{ max_chunk_length:200, sentence_search_limit:50, chunk_over_lap:20});
  });

  it('should chunk an indexable document correctly', () => {
    const date =new Date()
    const document: IndexableDocument = {
      id: '1',
      organisationId: 'org1',
      title: 'Test Document',
      sections: getSections(),
      source: AppNameDefinitions.ASANA,
      metadata: {
        "name": 'done',
        "status": 'done'
      },
      updatedAt: date,
    };

    const expectedChunks: IndexableDocChunk[] = [
      {
        chunkId: 0,
        organisationId: document.organisationId,
        documentId: document.id,
        title: document.title,
        source: AppNameDefinitions.ASANA,
        content: "\"Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked " ,
        metadata: {
          "name": 'done',
          "status": 'done'
        },
        updatedAt: date ,
        offsets: {
        }
      },
      {
        chunkId: 1,
        organisationId: document.organisationId,
        documentId: document.id,
        title: document.title,
        source: AppNameDefinitions.ASANA,
        content:"McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical literature, discovered the undoubtable source. Lorem Ipsum comes from sections 1.",
        metadata: {
          "name": 'done',
          "status": 'done'
        },
        updatedAt: document.updatedAt,
        offsets: {
          "400": "http://example.com/section0",
        }
      },
      {
        chunkId: 2,
        organisationId: document.organisationId,
        documentId: document.id,
        title: document.title,
        source: AppNameDefinitions.ASANA,
        content:" Lorem Ipsum comes from sections 1.10.32 and 1.10.33 of de Finibus Bonorum et Malorum (The Extremes of Good and Evil) by Cicero, written in 45 BC. This book is a treatise on the theory of ethics, very popular during the Renaissance." ,
        metadata: {
          "name": 'done',
          "status": 'done'
        },
        updatedAt: document.updatedAt,
        offsets: {
        }
      },
      {
        chunkId: 3,
        organisationId: document.organisationId,
        documentId: document.id,
        title: document.title,
        source: AppNameDefinitions.ASANA,
        content:" This book is a treatise on the theory of ethics, very popular during the Renaissance. The first line of Lorem Ipsum, Lorem ipsum dolor sit amet.., comes from a line in section 1.10.32. The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested." ,
        metadata: {
          "name": 'done',
          "status": 'done'
        },
        updatedAt: document.updatedAt,
        offsets: {
          "800": "http://example.com/section1",
        }
      },
      {
        chunkId: 4,
        organisationId: document.organisationId,
        documentId: document.id,
        title: document.title,
        source: AppNameDefinitions.ASANA,
        content:" The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested. Sections 1.10.32 and 1.10.33 from de Finibus Bonorum et Malorum by Cicero are also reproduced in their exact original form, accompanied by English versions from the 1914 translation by H." ,
        metadata: {
          "name": 'done',
          "status": 'done'
        },
        updatedAt: document.updatedAt,
        offsets: {
          "800": "http://example.com/section1"
        }
      },
      {
        chunkId: 5,
        organisationId: document.organisationId,
        documentId: document.id,
        title: document.title,
        source: AppNameDefinitions.ASANA,
        content:"33 from de Finibus Bonorum et Malorum by Cicero are also reproduced in their exact original form, accompanied by English versions from the 1914 translation by H. Rackham.\"",
        metadata: {
          "name": 'done',
          "status": 'done'
        },
        updatedAt: document.updatedAt,
        offsets: {
          "1055": "http://example.com/section2",
        }
      },
    ];
    const chunks = processor.chunkIndexableDocument(document);
    expect(chunks).toEqual(expectedChunks);
  });

  it('should chunk a document without sections correctly', () => {
    const date =new Date()
    const document: IndexableDocument = {
      id: '1',
      organisationId: 'org1',
      title: 'Test Document',
      sections: [],
      source: AppNameDefinitions.ASANA,
      metadata: {
        "name": 'done',
        "status": 'done'
      },
      updatedAt: date,
    };

    const expectedChunks: IndexableDocChunk[] = [
      {
        chunkId: 0,
        organisationId: document.organisationId,
        documentId: document.id,
        title: document.title,
        source: AppNameDefinitions.ASANA,
        content: "",
        metadata: {
          "name": 'done',
          "status": 'done'
        },
        updatedAt: date ,
        offsets: {
        }
      },
    ];
    const chunks = processor.chunkIndexableDocument(document);
    expect(chunks).toEqual(expectedChunks);
  });
});