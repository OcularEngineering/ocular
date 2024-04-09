import { AbstractSearchService, IndexableDocChunk, SearchResult, SearchContext } from "@ocular/types"
import { AzureOpenAIOptions, SearchEngineOptions, SearchOptions } from "../types/search/options"
import { ConfigModule, Logger } from "../types"
import { SearchIndexClient } from "@azure/search-documents"
import { parseBoolean, removeNewlines} from "@ocular/utils"
import { ILLMInterface } from "@ocular/types"
import { IVectorDB } from "@ocular/types"
import { ISearchService } from "@ocular/types"

type InjectedDependencies = {
  searchIndexClient: SearchIndexClient
  logger: Logger
  indexName: string
}

class SearchService extends AbstractSearchService {
  isDefault = false

  protected readonly openAiService_:  ILLMInterface
  protected readonly config_: ConfigModule
  protected readonly logger_: Logger
  protected readonly defaultIndexName_: string
  protected readonly vectorDBService_ : IVectorDB
  // protected readonly searchIndexService_ : ISearchService

  constructor(container, config) {
    super(container, config)
    this.logger_ = container.logger
    this.openAiService_ = container.openAiService
    this.vectorDBService_ = container.vectorDBService
    // this.searchIndexService_ = container.searchIndexService
    this.defaultIndexName_ = container.indexName

  }

  async search(indexName?:string, query?: string, context?: SearchContext): Promise<SearchResult> {
    indexName = indexName? indexName:this.defaultIndexName_;
    // Query Has Text: Indicates to Query Full Text Search Index For Results.
    const hasText = ['text', 'hybrid', undefined].includes(context?.retrieval_mode);

    // Query Has Vector Search: Indicates To Query Vector DB Search For Results.
    const hasVectors = ['vectors', 'hybrid', undefined].includes(context?.retrieval_mode);

    // Number of Results to Query: Default is 3
    const top = context?.top ? Number(context?.top) : 3;

    // If retrieval mode includes vectors, compute an embedding for the query
    let allDocs = []
    let queryVector;
    // if (hasVectors) {
      console.log("Vector Search", query, indexName)
      queryVector = await this.openAiService_.createEmbeddings(query!);
      console.log("After Vector Embeddings",queryVector)
      const vectorSearch = await this.vectorDBService_.searchDocuments(indexName,queryVector )
      allDocs.push(...vectorSearch.docs);
      console.log("Vector Search Docs ", vectorSearch.docs)
    // }

    // Retrieve Search Index Results
    // if (hasText){
      // const textSearch = await this.searchIndexService_.search(indexName,query)
      // console.log("textSearch Docs ")
      // console.log(textSearch)
      // allDocs.push(...textSearch.docs);
    // }


    return {
      query: query ?? '',
      docs: allDocs,
      ai_content: "",
    };
  }

  addDocuments(indexName: string, documents: IndexableDocChunk[]){return "Not Implemented"}

}

export default SearchService