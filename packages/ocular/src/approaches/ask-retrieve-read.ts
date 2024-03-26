import { IAskApproach, ISearchService, ILLMInterface, AutoflowContainer } from "@ocular/types";
import { ApproachContext, ApproachResponse, ApproachResponseChunk } from "@ocular/types";
import { MessageBuilder} from "../utils/message";
import { EntityManager } from "typeorm";
import { ApproachDefinitions } from "@ocular/types";

const SYSTEM_CHAT_TEMPLATE = `You are an intelligent assistant who can help with a variety of tasks. How can I assist you today?`;

// shots/sample conversation
const QUESTION = `
'What happens if a guest breaks something?'

Sources:
info1.txt: Compensation for Damage Accidents can happen during a stay, and we have procedures in place to handle compensation for damage. If you, as a guest, notice damage during your stay or if you're a host and your property has been damaged, report it immediately through the platform
info2.pdf: Guests must not engage in any prohibited activities, including but not limited to: - Unauthorized parties or events - Smoking in non-smoking properties - Violating community rules - Damaging property or belongings
info3.pdf: Once you've provided the necessary information, submit the report. Our financial support team will investigate the matter and work to resolve it promptly.
`;

const ANSWER = `If a guest breaks something, report the damage immediately through the platform [info1.txt]. Once you've provided the necessary information, submit the report. Our financial support team will investigate the matter and work to resolve it promptly [info3.pdf].`;

type InjectedDependencies = AutoflowContainer & {
  openAiService: ILLMInterface,
  searchService: ISearchService,
}

/**
 * Simple retrieve-then-read implementation, using the AI Search and OpenAI APIs directly.
 * It first retrieves top documents from search, then constructs a prompt with them, and then uses
 * OpenAI to generate an completion (answer) with that prompt.
 */

export default class AskRetrieveThenRead implements IAskApproach {
  identifier = ApproachDefinitions.ASK_RETRIEVE_READ;
  private openai_: ILLMInterface;
  private searchService_: ISearchService;

  constructor(container: InjectedDependencies) {
    this.openai_ = container.openAiService;
    this.searchService_ = container.searchService;
  }

  async run(indexName: string, userQuery: string, context?: ApproachContext): Promise<ApproachResponse> {
    const { query, results, content } = await this.searchService_.search(indexName, userQuery, context);
    const messageBuilder = new MessageBuilder(context?.prompt_template || SYSTEM_CHAT_TEMPLATE);

    // const sources = content.map((c) => c.content).join(', ');
    // Add user question
    const userContent = `${userQuery}\nSources:\n${content}`;
    messageBuilder.appendMessage('user', userContent);

    // Add shots/samples. This helps model to mimic response and make sure they match rules laid out in system message.
    // messageBuilder.appendMessage('assistant', QUESTION);
    // messageBuilder.appendMessage('user', ANSWER);

    const messages = messageBuilder.messages;

    const chatCompletion = await this.openai_.completeChat(messages);

    const messageToDisplay = messageBuilder.messagesToString(messages);

    return {
      choices: [
        {
          index: 0,
          message: {
            role: 'assistant' as const,
            content: chatCompletion,
            context: {
              data_points: {
                // text: content.,
              },
              thoughts: `Question:<br>${query}<br><br>Prompt:<br>${messageToDisplay.replace('\n', '<br>')}`,
            },
          },
        },
      ],
      results: results,
      object: 'chat.completion',
    };
  }
}