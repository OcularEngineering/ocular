import { EntityManager } from "typeorm";
import { AutoflowContainer, ApproachDefinitions, SearchResultChunk, ISearchApproach, ISearchService, ILLMInterface, SearchResult, SearchContext } from "@ocular/types";
import { MessageBuilder} from "../utils/message";
import { chunksToSearchDocs } from "../utils";

const SYSTEM_CHAT_TEMPLATE = `You are an intelligent assistant who can helps Engineers at Ocular with a variety of tasks. Use 'you' to refer to the individual asking the questions even if they ask with 'I'.
Answer the following question using only the data provided in the sources below. How can I assist you today?`;

// // shots/sample conversation
// const QUESTION = `
// 'What happens if a guest breaks something?'

// Sources:
// info1.txt: Compensation for Damage Accidents can happen during a stay, and we have procedures in place to handle compensation for damage. If you, as a guest, notice damage during your stay or if you're a host and your property has been damaged, report it immediately through the platform
// info2.pdf: Guests must not engage in any prohibited activities, including but not limited to: - Unauthorized parties or events - Smoking in non-smoking properties - Violating community rules - Damaging property or belongings
// info3.pdf: Once you've provided the necessary information, submit the report. Our financial support team will investigate the matter and work to resolve it promptly.
// `;

// const ANSWER = `If a guest breaks something, report the damage immediately through the platform [info1.txt]. Once you've provided the necessary information, submit the report. Our financial support team will investigate the matter and work to resolve it promptly [info3.pdf].`;

type InjectedDependencies = AutoflowContainer & {
  openAiService: ILLMInterface,
  searchService: ISearchService,
}

/**
 * Retrieve-then-Read implementation, using the Ocular Search and OpenAI APIs directly.
 * It first retrieves top documents from the Search Service, then constructs a Prompt with them, and then uses
 * OpenAI to generate an completion (answer) with that prompt.
 */
export default class AskRetrieveThenRead implements ISearchApproach {
  identifier = ApproachDefinitions.ASK_RETRIEVE_READ;
  private openai_: ILLMInterface;
  private searchService_: ISearchService;

  constructor(container: InjectedDependencies) {
    this.openai_ = container.openAiService;
    this.searchService_ = container.searchService;
  }

  async run(indexName: string, userQuery: string, context?: SearchContext): Promise<SearchResult> {
    let hits = await this.searchService_.search(null, userQuery, context);

    hits = hits.filter(doc => doc !== null);

    let message = null;
    if (context && context.ai_completion) {
      // Initial System Message
      // const prompt = context?.prompt_template || SYSTEM_CHAT_TEMPLATE;

      const prompt =  SYSTEM_CHAT_TEMPLATE;
      const tokens = this.openai_.getChatModelTokenCount(prompt)
      const messageBuilder = new MessageBuilder(prompt, tokens);

      // Use Top 3 Sources To Generate AI Completion.
      // TODO: Use More Sophisticated Logic To Select Sources.
      const sources =  hits.map((c) => c.content).slice(0,3).join('');
      const userContent = `${userQuery}\nSources:\n${sources}`;

      const roleTokens: number = this.openai_.getChatModelTokenCount("user")
      const messageTokens: number = this.openai_.getChatModelTokenCount(userContent)
      messageBuilder.appendMessage('user', userContent, 1 ,(roleTokens + messageTokens));

      // Add shots/samples. This helps model to mimic response and make sure they match rules laid out in system message.
      // messageBuilder.appendMessage('assistant', QUESTION);
      // messageBuilder.appendMessage('user', ANSWER);
      const messages = messageBuilder.messages;
      const chatCompletion = await this.openai_.completeChat(messages);
      const messageToDisplay = MessageBuilder.messagesToString(messages);
      message = {
        role: 'assistant' as const,
        content: chatCompletion,
        context: {
          data_points: hits.slice(0,3),
          thoughts: `Question:<br>${userQuery}<br><br>Prompt:<br>${messageToDisplay.replace('\n', '<br>')}`,
        },
      };
    }

    // Remove Duplicates Convert IndexableChunks To SearchDocs for easy UI display
    // TODO: Remove Duplicate Chunks Intelligently.
    const searchResultDocs = chunksToSearchDocs(hits);
    return {
      message: message,
      hits:searchResultDocs,
    };
  }

  async *runWithStreaming(query: string, context?: SearchContext): AsyncGenerator<SearchResultChunk, void> {
    throw new Error('Streaming not supported for this approach.');
  }

}