import { AbstractSearchService, ApproachContext, SearchDocumentsResult } from "@ocular/types"
import { AzureOpenAIOptions, SearchEngineOptions, SearchOptions } from "../types/search/options"
import { ConfigModule, Logger } from "../types"
import { SearchIndexClient } from "@azure/search-documents"
import { parseBoolean, removeNewlines} from "@ocular/utils"
import { ILLMInterface } from "@ocular/types"
import { IndexableDocChunk } from "@ocular/types"

type InjectedDependencies = {
  searchIndexClient: SearchIndexClient
  logger: Logger
}

class SearchService extends AbstractSearchService {
  isDefault = false

  protected readonly openAiService_:  ILLMInterface
  protected readonly config_: ConfigModule
  protected readonly searchIndexClient_: SearchIndexClient
  protected readonly logger_: Logger

  constructor(container, config) {
    super(container, config)
    this.searchIndexClient_ = container.searchIndexClient
    this.logger_ = container.logger
    this.openAiService_ = container.openAiService
  }

  async search(indexName?:string, query?: string, context: ApproachContext = {}): Promise<SearchDocumentsResult> {
    const hasText = ['text', 'hybrid', undefined].includes(context?.retrieval_mode);
    const hasVectors = ['vectors', 'hybrid', undefined].includes(context?.retrieval_mode);
    const useSemanticCaption = parseBoolean(context?.semantic_captions) && hasText;
    const top = context?.top ? Number(context?.top) : 3;
    const excludeCategory: string | undefined = context?.exclude_category;
    const filter = excludeCategory ? `category ne '${excludeCategory.replace("'", "''")}'` : undefined;

    // If retrieval mode includes vectors, compute an embedding for the query
    let queryVector;
    if (hasVectors) {
      queryVector = await this.openAiService_.createEmbeddings(query!);
    }

    // Only keep the text query if the retrieval mode uses text, otherwise drop it
    const queryText = hasText ? query : '';

    // Get Search Client
    const searchClient = this.searchIndexClient_.getSearchClient(indexName!);

    // Use semantic L2 reranker if requested and if retrieval mode is text or hybrid (vectors + text)
    const searchResults = await (context?.semantic_ranker && hasText
      ? searchClient.search(queryText, {
          filter,
          queryType: 'semantic',
          semanticSearchOptions: {
            answers: {
              answerType: "extractive",
              count: 1
            },
            captions:{
              captionType: "extractive",
            },
            configurationName: "my-semantic-config",
          },
          top,
          vectorSearchOptions: {
            queries: [{
              kind: 'vector',
              vector: queryVector,
              fields: ["titleVector", "contentVector"],
              kNearestNeighborsCount: 20,
            },
          ]},
        })
      : searchClient.search(queryText, {
          filter,
          top,
          vectorSearchOptions: {
            queries: [{
              kind: 'vector',
              vector: queryVector,
              fields: ["titleVector", "contentVector"],
              kNearestNeighborsCount: 20,
            },
          ]},
        }));

    const results: string[] = [];
    // if (useSemanticCaption) {
    //   for await (const result of searchResults.results) {
    //     // TODO: ensure typings
    //     const document = result as any;
    //     const captions = document['@search.captions'];
    //     const captionsText = captions?.map((c: any) => c.text).join(' . ');
    //     results.push(`${document["this.sourcePageField"]}: ${removeNewlines(captionsText)}`);
    //   }
    // } else {
    //   for await (const result of searchResults.results) {
    //     // TODO: ensure typings
    //     const document = result.document as any;
    //     results.push(`${document[this.sourcePageField]}: ${removeNewlines(document[this.contentField])}`);
    //   }
    // }
    const indexableDocuments: IndexableDocChunk[] = []
    for await (const result of searchResults.results) {
      const document = result.document as IndexableDocChunk;
      document.contentVector = null
      document.titleVector = null
      results.push(document.content);
      indexableDocuments.push(document)
    }               
    const content = results.join('\n');

    return {
      query: queryText ?? '',
      results: indexableDocuments,
      content: content,
    };
  }

  // protected async lookupDocument(query: string): Promise<any> {
  //   const searchResults = await this.search.search(query, {
  //     top: 1,
  //     includeTotalCount: true,
  //     queryType: 'semantic',
  //     queryLanguage: 'en-us',
  //     speller: 'lexicon',
  //     semanticConfiguration: 'default',
  //     answers: 'extractive|count-1',
  //     captions: 'extractive|highlight-false',
  //   });

  //   const answers = await searchResults.answers;
  //   if (answers && answers.length > 0) {
  //     return answers[0].text;
  //   }
  //   if (searchResults.count ?? 0 > 0) {
  //     const results: string[] = [];
  //     for await (const result of searchResults.results) {
  //       // TODO: ensure typings
  //       const document = result.document as any;
  //       results.push(document[this.contentField]);
  //     }
  //     return results.join('\n');
  //   }
  //   return undefined;
  // }
}

export default SearchService


  // async search(
  //   indexName: string,
  //   query: string,
  //   options: SearchOptions & Record<string, unknown>
  // ) {
  //   console.log("Query", query)
  // //   // Hybrid Vector Search
  // // // 1. Cross Field Vector Search
  // // // 2. Hybrid Vector Search -> Text + Vector Query
  // // // 3. Vector Search with Filter (Filter With Source(Github, Gitlab, etc))
  // // // 4. Semantic Search
  // // // TODO: Abstract This Into A Query Service That Does Query Translation.
  // let filter = ''
  // if (options.hybridVectorSearch) {
  //   filter = `source eq ${options.categoryFilter}`
  // }

  // const searchClient = this.searchIndexClient_.getSearchClient(indexName);
  // const searchResults = await searchClient.search(query, {
  //   // vectorSearchOptions: {
  //   //   queries: [
  //   //     {
  //   //       kind: 'vector',
  //   //       vector: await this.generateEmbeddings(query),
  //   //       fields: ["titleVector", "contentVector"],
  //   //       kNearestNeighborsCount: 5,
  //   //     }
  //   //   ],
  //   // },
  //   filter: filter,
  //   select: ["title","source","content","updatedAt","location"],
  //   top: 10,
  //   // queryType: "semantic",
  //   // semanticSearchOptions: {
  //   //   answers: {
  //   //     answerType: "extractive",
  //   //     count: 3
  //   //   },
  //   //   captions:{
  //   //     captionType: "extractive",
  //   //   },
  //   //   configurationName: "my-semantic-config",
  //   // },
  //   });

    // for await (const answer of searchResults.answers) {
    //   if (answer.highlights) {
    //     console.log(`Semantic answer: ${answer.highlights}`);
    //   } else {
    //     console.log(`Semantic answer: ${answer.text}`);
    //   }
    //   console.log(`Semantic answer score: ${answer.score}\n`);
    // }

    // for await (const result of searchResults.results) {
    //   // console.log(`Title: ${result.document.title}`);
    //   // console.log(`Reranker Score: ${result.rerankerScore}`); // Reranker score is the semantic score
    //   // console.log(`Content: ${result.document.content}`);
    //   // console.log(`Category: ${result.document.category}`);
  
    //   if (result.captions) {
    //     const caption = result.captions[0];
    //     if (caption.highlights) {
    //       console.log(`Caption: ${caption.highlights}`);
    //     } else {
    //       console.log(`Caption: ${caption.text}`);
    //     }
    //   }
  
    //   console.log(`\n`);
    // }
    // const resultsArray = [];
    // for await (const result of searchResults.results) {
    //   resultsArray.push(result);
    // }
    // return resultsArray;
  
    // const inputData = JSON.parse(
    //   fs.readFileSync("/Users/louismurerwa/Desktop/LuxaInvestmentsProjects/autoflow-ai/packages/core-backend/src/data/mock-data.json", "utf-8")
    // );

    // return inputData;
  // }