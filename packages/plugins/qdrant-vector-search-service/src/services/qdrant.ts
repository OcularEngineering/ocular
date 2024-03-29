import {AbstractVectorDBService, IndexableDocument, IndexableDocChunk, SearchResult } from "@ocular/types"
import {QdrantClient, Schemas } from '@qdrant/js-client-rest';
import { v4 as uuidv4 } from 'uuid';

const uid = uuidv4();
console.log(uid);


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
  protected collectionName_: string = "ocular"
  protected embeddingSize_: number
 
  constructor(container, options) {
    super(container,options)
    const { quadrant_db_url, embedding_size} = options

    if (!quadrant_db_url) {
      throw new Error("Please provide a valid search DB URL")
    }

    if (!embedding_size) {
      throw new Error("Please provide an embedding size")
    }
    
    this.qdrantClient_  = new QdrantClient({url: quadrant_db_url});
    console.log(quadrant_db_url)
    // Create A Collection In QDrant
        // Try to get the collection
      // const collection = this.qdrantClient_.getCollection(this.collectionName_);
      // If the collection does not exist, create it
      // if (!collection) {
        const vectorCreationParams: Schemas["CollectionParams"] = {
            vectors: {
              title: { size: embedding_size, distance: "Cosine" },
              content: { size: embedding_size,  distance: "Cosine" },
            }, 
        }
        this.qdrantClient_.createCollection(this.collectionName_, 
          vectorCreationParams
        ).then(()=>{
          this.qdrantClient_.createPayloadIndex(this.collectionName_, {
            field_name: "source",
            field_schema: "keyword",
        })
        }).catch((error)=>{
          if (error.message !== 'Conflict') {
            console.error(error.message)
          }
        })
  }

  async addDocuments(indexName:string, doc: IndexableDocChunk[]){
    try{
      const points = doc.map(this.translateIndexableDocToQuadrantPoint);
      await this.qdrantClient_.upsert(this.collectionName_, { points });
    } catch(error) {
        console.error(error)
    }
  }

  async searchDocuments(org_id: string, vector: number[], ): Promise<SearchResult>{
    try{
    
    // const filter = {
    //   must: [{ key: "group_id", match: { value: org_id } }],
    // }

    // TODO
    //Look Into Search Group By Points
    //Look Into Search Filtering

  console.log("Qdrant Searches", vector)
    const searches: SearchResults[][] = await this.qdrantClient_.searchBatch(this.collectionName_, {
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

    console.log("qdrant searches",searches)

    const flattenedSearches = searches.flat();

    console.log("qdrant",flattenedSearches)
          
    return{
      ai_content: "",
      query: "",
      docs:  flattenedSearches.map(result => result?.payload as IndexableDocChunk)
    }
    }catch(error){
      console.log("Error Reading Docs To Quadrant",error)
    }
  } 


  private translateIndexableDocToQuadrantPoint(doc: IndexableDocChunk){
    return {
      id: uuidv4(),
      payload: {
        id:doc.id,
        organisationId: doc.organisationId,
        title: doc.title,
        source: doc.source,
        content: doc.content,
        metadata: doc.metadata,
        updatedAt: doc.updatedAt
      },
      vector: {
        title: doc.titleVector,
        content: doc.contentVector
      }
    };
  }
}
