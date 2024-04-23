import { IndexableDocument, IndexableDocChunk, AppNameDefinitions, AbstractDocumentProcesserService, Section, DocType } from "@ocular/types";
import documentProcessorService from '../services/document-processor';
import fs from 'fs';
import path from 'path';
import { get } from "http";

// Get Sections From Dummy File
function getOneSection(): Section[]{
  let filePath = path.join(__dirname, 'file_content.txt');
  let fileContent = fs.readFileSync(filePath, 'utf8');
  return [{
    content: fileContent,
    link: `http://example.com/section/0`
   }]
}

function getSections(): Section[]{
  let filePath = path.join(__dirname, 'file_content.txt');
  let fileContent = fs.readFileSync(filePath, 'utf8');
  let sections:Section[] = [];
  for (let i = 0; i < fileContent.length; i += 300) {
    let sectionContent = fileContent.slice(i, i + 300);
    sections.push({
      content: sectionContent,
      link: `http://example.com/section${sections.length}`
    });
  }
  return sections
}


describe('DocumentProcessor Split Text Document', () => {
  let processor:  AbstractDocumentProcesserService;
  beforeEach(() => {
    processor = new documentProcessorService({},{ max_chunk_length:200, sentence_search_limit:50, chunk_over_lap:20});
  });

  // it('should chunk a document without sections correctly', async () => {
  //   const date =new Date()
  //   const document: IndexableDocument = {
  //     id: '1',
  //     organisationId: 'org1',
  //     title: 'Test Document',
  //     source: AppNameDefinitions.ASANA,
  //     metadata: {
  //       "name": 'done',
  //       "status": 'done'
  //     },
  //     type: DocType.TEXT,
  //     updatedAt: date,
  //   };
  
  //   const expectedChunks: IndexableDocChunk[] = [
  //     {
  //       chunkId: 0,
  //       organisationId: document.organisationId,
  //       documentId: document.id,
  //       title: document.title,
  //       source: AppNameDefinitions.ASANA,
  //       content: "",
  //       metadata: {
  //         "name": 'done',
  //         "status": 'done'
  //       },
  //       tokens: 2,
  //       updatedAt: date ,
  //     },
  //   ];
  //   const chunks = await processor.chunkIndexableDocument(document);
  //   expect(chunks).toEqual(expectedChunks);
  // });

  // it('Chunk One Large Document With One Section Into Multiple Chunks', async () => {
  //     const date =new Date()
  //     const document: IndexableDocument = {
  //       id: '1',
  //       organisationId: 'org1',
  //       title: 'Test Document',
  //       sections: getOneSection(),
  //       source: AppNameDefinitions.ASANA,
  //       type: DocType.TEXT,
  //       metadata: {
  //         "name": 'done',
  //         "status": 'done'
  //       },
  //       updatedAt: date,
  //     };
  
  //     const expectedChunks: IndexableDocChunk[] = [
  //       {
  //         chunkId: 0,
  //         organisationId: document.organisationId,
  //         documentId: document.id,
  //         title: document.title,
  //         source: AppNameDefinitions.ASANA,
  //         content: "\"Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin" ,
  //         metadata: {
  //           "name": 'done',
  //           "status": 'done'
  //         },
  //         tokens: 46,
  //         updatedAt: date
  //       },
  //       {
  //         chunkId: 1,
  //         organisationId: document.organisationId,
  //         documentId: document.id,
  //         title: document.title,
  //         source: AppNameDefinitions.ASANA,
  //         content: "McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in" ,
  //         metadata: {
  //           "name": 'done',
  //           "status": 'done'
  //         },
  //         tokens: 45,
  //         updatedAt: document.updatedAt,
  //       },
  //       {
  //         chunkId: 2,
  //         organisationId: document.organisationId,
  //         documentId: document.id,
  //         title: document.title,
  //         source: AppNameDefinitions.ASANA,
  //         content: "of the word in classical literature, discovered the undoubtable source. Lorem Ipsum comes from sections 1.10.32 and 1.10.33 of de Finibus Bonorum et Malorum (The Extremes of Good and Evil) by Cicero,",
  //         metadata: {
  //           "name": 'done',
  //           "status": 'done'
  //         },
  //         tokens: 55,
  //         updatedAt: document.updatedAt,
  //       },
  //       {
  //         chunkId: 3,
  //         organisationId: document.organisationId,
  //         documentId: document.id,
  //         title: document.title,
  //         source: AppNameDefinitions.ASANA,
  //         content: "Evil) by Cicero, written in 45 BC. This book is a treatise on the theory of ethics, very popular during the Renaissance. The first line of Lorem Ipsum, Lorem ipsum dolor sit amet.., comes from a line",
  //         metadata: {
  //           "name": 'done',
  //           "status": 'done'
  //         },
  //         tokens: 49,
  //         updatedAt: document.updatedAt,
  //       },
  //       {
  //         chunkId: 4,
  //         organisationId: document.organisationId,
  //         documentId: document.id,
  //         title: document.title,
  //         source: AppNameDefinitions.ASANA,
  //         content: "comes from a line in section 1.10.32. The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested. Sections 1.10.32 and 1.10.33 from de Finibus Bonorum et Malorum",
  //         metadata: {
  //           "name": 'done',
  //           "status": 'done'
  //         },
  //         updatedAt: document.updatedAt,
  //         tokens: 56,
  //       },
  //       {
  //         chunkId: 5,
  //         organisationId: document.organisationId,
  //         documentId: document.id,
  //         title: document.title,
  //         source: AppNameDefinitions.ASANA,
  //         content: "Bonorum et Malorum by Cicero are also reproduced in their exact original form, accompanied by English versions from the 1914 translation by H. Rackham.\"",
  //         metadata: {
  //           "name": 'done',
  //           "status": 'done'
  //         },
  //         updatedAt: document.updatedAt,
  //         tokens: 33,
  //       },
  //     ];
  //     const chunks = await processor.chunkIndexableDocument(document);
  //     expect(chunks).toEqual(expectedChunks);
  //   });

  it('should chunk an indexable document correctly', async () => {
    const date =new Date()
    const document: IndexableDocument = {
      id: '1',
      organisationId: 'org1',
      title: 'Test Document',
      sections: getSections(),
      source: AppNameDefinitions.ASANA,
      type: DocType.TEXT,
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
        content: "\"Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin" ,
        metadata: {
          "name": 'done',
          "status": 'done'
        },
        tokens: 46,
        updatedAt: date
      },
      {
        chunkId: 1,
        organisationId: document.organisationId,
        documentId: document.id,
        title: document.title,
        source: AppNameDefinitions.ASANA,
        content: "McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in" ,
        metadata: {
          "name": 'done',
          "status": 'done'
        },
        tokens: 45,
        updatedAt: document.updatedAt,
      },
      {
        chunkId: 2,
        organisationId: document.organisationId,
        documentId: document.id,
        title: document.title,
        source: AppNameDefinitions.ASANA,
        content: "of the word in classical literature, discovered the undoubtable source. Lorem Ipsum comes from sections 1.10.32 and 1.10.33 of de Finibus Bonorum et Malorum (The Extremes of Good and Evil) by Cicero,",
        metadata: {
          "name": 'done',
          "status": 'done'
        },
        tokens: 55,
        updatedAt: document.updatedAt,
      },
      {
        chunkId: 3,
        organisationId: document.organisationId,
        documentId: document.id,
        title: document.title,
        source: AppNameDefinitions.ASANA,
        content: "Evil) by Cicero, written in 45 BC. This book is a treatise on the theory of ethics, very popular during the Renaissance. The first line of Lorem Ipsum, Lorem ipsum dolor sit amet.., comes from a line",
        metadata: {
          "name": 'done',
          "status": 'done'
        },
        tokens: 49,
        updatedAt: document.updatedAt,
      },
      {
        chunkId: 4,
        organisationId: document.organisationId,
        documentId: document.id,
        title: document.title,
        source: AppNameDefinitions.ASANA,
        content: "comes from a line in section 1.10.32. The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested. Sections 1.10.32 and 1.10.33 from de Finibus Bonorum et Malorum",
        metadata: {
          "name": 'done',
          "status": 'done'
        },
        updatedAt: document.updatedAt,
        tokens: 56,
      },
      {
        chunkId: 5,
        organisationId: document.organisationId,
        documentId: document.id,
        title: document.title,
        source: AppNameDefinitions.ASANA,
        content: "Bonorum et Malorum by Cicero are also reproduced in their exact original form, accompanied by English versions from the 1914 translation by H. Rackham.\"",
        metadata: {
          "name": 'done',
          "status": 'done'
        },
        updatedAt: document.updatedAt,
        tokens: 33,
      },
    ];
    const chunks = await processor.chunkIndexableDocument(document);
    expect(chunks).toEqual(expectedChunks);
  });
});