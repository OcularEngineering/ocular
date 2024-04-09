import { Client } from 'typesense';
import { AbstractSearchService, IndexableDocument, IndexableDocChunk, SearchContext, SearchResult } from "@ocular/types"

declare type FieldType = "string" | "int32" | "int64" | "float" | "bool" | "geopoint" | "geopoint[]" | "string[]" | "int32[]" | "int64[]" | "float[]" | "bool[]" | "object" | "object[]" | "auto" | "string*";

const indexableDocSchema = {
  fields: [
    {'name': 'id', 'type': "string" as FieldType , 'facet': false },
    {'name': 'organisationId', 'type': "string"  as FieldType, 'facet': false },
    {'name': 'sourceDocId', 'type': "string"  as FieldType, 'facet': false},
    {'name': 'title', 'type': "string"  as FieldType,'facet': false},
    {'name': 'source', 'type': "string"  as FieldType, 'facet': true },
    {'name': 'content', 'type': "string"  as FieldType, 'facet': false, "optional": true},
    {'name': 'metadata', 'type': "string"  as FieldType, 'facet': false, "optional": true},
    {'name': 'updatedAt', 'type': "int64"  as FieldType, 'facet': false},
    {'name': 'location', 'type': "string"  as FieldType, 'facet': false},
  ],
}

export default class typesenseService extends AbstractSearchService  {
  protected typesenseClient_: Client
  protected collectionName_: string = "Ocular"

  isDefault = false
 
  constructor(container, options) {
    super(container,options)

    const { typesense_host} = options
   
    this.typesenseClient_  = new Client({
      'nodes': [{
        'host': typesense_host, // For Typesense Cloud use xxx.a1.typesense.net
        'port': 8108,      // For Typesense Cloud use 443
        'protocol': 'http'   // For Typesense Cloud use https
      }],
      'apiKey': 'xyz',
      'connectionTimeoutSeconds': 2
    })
  
     this.typesenseClient_.collections().retrieve()
     .then((collections)=> {
      if (!collections.some(collection => collection['name'] === this.collectionName_)) {
        this.typesenseClient_.collections().create(
        {
          name:this.collectionName_,
          fields: indexableDocSchema.fields
        }
      )
    }})
    .catch((error)=> {
      if (error.message !== 'Conflict') {
        throw error;
      }
            throw error;
    }) 
  }
  
  async addDocuments(indexName: string, docs: IndexableDocChunk[]){
    let retries = 0;
  
    while (retries < 5) {
      try {
        console.log("Indexer");
        const translatedDocs = docs.map(this.translateIndexableDocToTypesenseDoc);
        console.log(translatedDocs);
        await this.typesenseClient_.collections(this.collectionName_).documents().import(translatedDocs, {action: 'create',batch_size: docs.length});
        break; // If successful, break the loop
      } catch(error) {
        if (error.message === 'Not Ready or Lagging') {
          console.log('Typesense server is not ready or lagging. Retrying...');
          retries++;
          await new Promise(resolve => setTimeout(resolve, 1000));
        } else {
          console.log(error);
          break; // If error is not 'Not Ready or Lagging', break the loop
        }
      }
    }
  }


  async search(indexName: string, query:string, context?: SearchContext): Promise<SearchResult>{

    console.log("In Text Search")
    console.log(indexName, query)
    try{
      let searchParameters = {
        'q'         : query,
        'query_by'  : 'title,content',
        // 'filter_by' : `organisationId:=${indexName}`,
      }
      const {hits} = await this.typesenseClient_.collections(this.collectionName_).documents().search(searchParameters)

      console.log("Hits Text",hits)
      
    return{
      ai_content: "",
      query: query,
      docs: hits?.map(hit => hit.document as IndexableDocChunk )
    }
    }catch(error){
      console.log("Error Searching Docs From TypeSense",error)
    }
  } 

  private translateIndexableDocToTypesenseDoc(doc: IndexableDocChunk){
    return {
        chunkId:doc.chunkId,
        organisationId: doc.organisationId,
        documentId: doc.documentId,
        title: doc.title,
        source: doc.source,
        content: doc.content,
        metadata: doc.metadata,
        updatedAt: new Date().getTime(),
        offsets: doc.offsets
    };
  }
}

