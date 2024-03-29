import { IndexableDocChunk } from "../common";

export type SearchContext = {
  retrieval_mode?: 'hybrid' | 'text' | 'vectors';
  semantic_ranker?: boolean;
  semantic_captions?: boolean;
  top?: number;
  temperature?: number;
  prompt_template?: string;
  prompt_template_prefix?: string;
  prompt_template_suffix?: string;
  exclude_category?: string;
};


export interface SearchResult {
  ai_content: string;
  query: string;
  docs:  IndexableDocChunk[];
}

export interface ISearchService {
    // createIndex(indexName: string);
    addDocuments(indexName: string, documents: IndexableDocChunk[]);
    search(indexName: string, query: string, context?: SearchContext):  Promise<SearchResult>
  }

export abstract class AbstractSearchService
  implements ISearchService
{
  static _isSearchService = true

  static isSearchService(obj) {
    return obj?.constructor?._isSearchService
  }

  abstract readonly isDefault
  protected readonly options_: Record<string, unknown>

  get options(): Record<string, unknown> {
    return this.options_
  }

  protected constructor(container, options) {
    this.options_ = options
  }
  // abstract createIndex(indexName: string);
  abstract addDocuments(indexName: string, documents: IndexableDocChunk[]);
  abstract search(
    indexName: string,
    query: string ,
    context?: SearchContext
  ): Promise<SearchResult>
}