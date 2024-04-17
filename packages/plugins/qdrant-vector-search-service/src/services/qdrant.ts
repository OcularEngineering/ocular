import {AbstractVectorDBService, IndexableDocument, IndexableDocChunk, SearchResult } from "@ocular/types"
import {QdrantClient, Schemas } from '@qdrant/js-client-rest';
import { v5 as uuidv5 } from 'uuid';

interface SearchResults {
  id: string | number;
  version: number;
  score: number;
  payload?: Record<string, unknown> | { [key: string]: unknown; };
  vector?: Record<string, unknown> | number[] | { [key: string]: number[] | { indices: number[]; values: number[]; }; };
  shard_key?: number| string | Record<string, unknown>;
}

export default class qdrantService extends AbstractVectorDBService  {
  protected qdrantClient_: QdrantClient
  protected embeddingSize_: number
  protected UUIDHASH = '1b671a64-40d5-491e-99b0-da01ff1f3341';
 
  constructor(container, options) {
    super(container,options)
    const { quadrant_db_url, embedding_size} = options

    if (!quadrant_db_url) {
      throw new Error("Please provide a valid search DB URL")
    }

    if (!embedding_size) {
      throw new Error("Please provide an embedding size")
    }
    this.embeddingSize_ = embedding_size
    this.qdrantClient_  = new QdrantClient({url: quadrant_db_url});
    console.log("Qdrant Service Initialized", quadrant_db_url, embedding_size)
  }

  async createIndex(indexName: string){
    try{
      const vectorCreationParams: Schemas["CollectionParams"] = {
        vectors: {
          title: { size: this.embeddingSize_, distance: "Cosine" },
          content: { size: this.embeddingSize_,  distance: "Cosine" },
        }, 
      }
     await this.qdrantClient_.createCollection(indexName, 
        vectorCreationParams
      )
    }catch(error){
      if (error.statusText==="Conflict") {
        console.log(`Index ${indexName} already exists`);
      } else {
        console.error(error.status)
      }
    }
  }
   

  async addDocuments(indexName:string, docs: IndexableDocChunk[]){
    console.log("Adding Docs to Qdrant", docs)
    console.log("Index Name", indexName)
    try{
      const points = docs.map(this.translateIndexableDocToQuadrantPoint);
      await this.qdrantClient_.upsert(indexName, { points });
    } catch(error) {
        console.log("QDrant: Error Adding Docs", error)
    }
  }

  async searchDocuments(indexName: string, vector: number[] ): Promise<IndexableDocChunk[]>{
    try{
      const searches: SearchResults[][] = await this.qdrantClient_.searchBatch(indexName, {
        searches: [
          {
            vector: {
              name: "title",
              vector: vector
            },
            limit: 5,
            with_payload: true,
          },
          {
            vector: {
              name: "content",
              vector: vector
            },
            limit: 5,
            with_payload: true,
          }
        ],
      })

      const flattenedSearches = searches.flat();
      const uniqueSearchResults = flattenedSearches.reduce((acc, current) => {
        const x = acc.find(item => item.id === current.id);
        if (!x) {
          return acc.concat([current]);
        } else {
          return acc;
        }
      }, []).map(doc => doc.payload as IndexableDocChunk);

   
    return uniqueSearchResults
    }catch(error){
      console.log("Qdrant: Error Searching Docs From Quadrant",error)
    }
  } 

  async deleteIndex(indexName: string){
    try{
      await this.qdrantClient_.deleteCollection(indexName)
    } catch(error){
      console.log("Error Deleting Index ", error)
    }
    
  }

  private createDocUUID(doc : IndexableDocChunk){
    let name = `${doc.organisationId}-${doc.documentId}-${doc.chunkId}`;
    return uuidv5(name,this.UUIDHASH);
  }


  private translateIndexableDocToQuadrantPoint = (doc: IndexableDocChunk) => {
    return {
      id: this.createDocUUID(doc),
      payload: {
        chunkId:doc.chunkId,
        organisationId: doc.organisationId,
        documentId: doc.documentId,
        title: doc.title,
        source: doc.source,
        content: doc.content,
        metadata: doc.metadata,
        updatedAt: doc.updatedAt,
      },
      vector: {
        title: doc.titleEmbeddings,
        content: doc.contentEmbeddings
      }
    };
  }

  
}
