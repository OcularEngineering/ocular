import { AbstractSearchService, IndexableDocChunk,SearchResult , SearchContext } from "@ocular/types"
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

  constructor(container, config) {
    super(container, config)
    this.logger_ = container.logger
    this.openAiService_ = container.openAiService
    this.vectorDBService_ = container.vectorDBService
    this.defaultIndexName_ = container.indexName

  }

  async search(indexName?:string, query?: string, context?: SearchContext): Promise<IndexableDocChunk[]> {
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
    queryVector = await this.openAiService_.createEmbeddings(query!);
    const hits = await this.vectorDBService_.searchDocuments(indexName,queryVector )
    allDocs.push(...hits);
    return allDocs
  }

  addDocuments(indexName: string, documents: IndexableDocChunk[]){return "Not Implemented"}

}

export default SearchService