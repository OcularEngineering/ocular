import { AbstractSearchService, IndexableDocChunk,SearchResult , SearchContext, IVectorDB, ISearchService, ILLMInterface, ISearchApproach  } from "@ocular/types"
import { AzureOpenAIOptions, SearchEngineOptions, SearchOptions } from "../types/search/options"
import { ConfigModule, Logger } from "../types"
import { SearchIndexClient } from "@azure/search-documents"
import { parseBoolean, removeNewlines} from "@ocular/utils"

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

  constructor(container, config) {
    super(container, config)
    this.logger_ = container.logger
    this.openAiService_ = container.openAiService
    this.vectorDBService_ = container.vectorDBService
    this.defaultIndexName_ = container.indexName
  }

  async search(indexName?:string, query?: string, context?: SearchContext): Promise<IndexableDocChunk[]> {
    indexName = indexName? indexName:this.defaultIndexName_;
    // // Query Has Text: Indicates to Query Full Text Search Index For Results.
    // const hasText = ['text', 'hybrid', undefined].includes(context?.retrieval_mode);

    // // Query Has Vector Search: Indicates To Query Vector DB Search For Results.
    // const hasVectors = ['vectors', 'hybrid', undefined].includes(context?.retrieval_mode);

    // If retrieval mode includes vectors, compute an embedding for the query
    const queryVector = await this.openAiService_.createEmbeddings(query!);
    const hits = await this.vectorDBService_.searchDocuments(indexName, queryVector, context ? context : {});
    return hits
  }

  async executeSearchApproach(q: string, context: SearchContext ): Promise<SearchResult> {
    // HardCode Search Approach
    // TODO: Resolve Search Approach Dynamically From Context
    // const results = await this.searchApproach_.run(this.defaultIndexName_, q , context);
    // return results
    return null
  }
}

export default SearchService