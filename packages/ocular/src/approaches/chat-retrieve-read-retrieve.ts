import { EntityManager } from "typeorm";
import {
  AutoflowContainer,
  ApproachDefinitions,
  SearchResultChunk,
  ISearchService,
  ILLMInterface,
  SearchResults,
  SearchContext,
  Message,
  IChatApproach,
  ChatContext,
  ChatResponse,
  SearchChunk,
  ChatResponseChunk,
} from "@ocular/types";
import { MessageBuilder } from "../utils/message";
import { IndexableDocChunk } from "@ocular/types";

const SYSTEM_MESSAGE_CHAT_CONVERSATION = `
You are Ocular Co-pilot, an AI Assistant designed to help employees at Ocular answer work-related questions. Answer concisely and directly based on the available
information in the provided sources. Follow these guidelines:

1. **Fact-Based Answers Only**: Provide answers only using information from the sources listed below. If there isn't adequate information, state that you don't know.
2. **Ask Clarifying Questions**: If the question is unclear, ask for more details.
3. **Language Consistency**: Respond in the language used by the user.
4. **Tabular Data**: For questions requiring tabular answers, use HTML tables.
5. **Citations**: Always reference the source for each fact you use in your answer using square brackets, for example: [source1.txt].
6. **Examples and Code Snippets**: Where applicable, provide examples or code snippets from the sources provided.
7. **Formatted Responses**: Provide formatted responses with titles, sections, and paragraphs as needed.

Please provide your inquiry and I will assist you based on the information available in the sources.
{follow_up_questions_prompt}
{injected_prompt}

`;

const FOLLOW_UP_QUESTIONS_PROMPT_CONTENT = `Generate 3 very brief follow-up questions that the user would likely ask next.
Enclose the follow-up questions in double angle brackets. Example:
<<Am I allowed to invite friends for a party?>>
<<How can I ask for a refund?>>
<<What If I break something?>>

Do no repeat questions that have already been asked.
Make sure the last question ends with ">>".`;

const QUERY_PROMPT_TEMPLATE = `

1.Extract the following relevant metadata fields from the user query and format them in JSON such as:

  Date 
  Source like (e.g., Jira, Confluence, Web-Connector, Slack)

  if you can not extract relevant metadata fields from the user query return metadata fields as null.

2.Generate a optimized search query based on the conversation history and the new user question, following these rules:

  Exclude special characters like ‘+’.
  Exclude cited source filenames and document names.
  Exclude text inside [] or <<>>.
  Translate non-English questions into anglish before generating the search query.
  If unable to generate a search query, return the number 0.

  Return the output in the following format:
  Output:

    {
      "metadata": {
        "Date": "...revlevant date metadata...",
        'sources':['...relevant sources...'],
      },
      "search_query": "... generate the search query here ..."
    }
`;

const QUERY_PROMPT_FEW_SHOTS: Message[] = [
  { role: "user", content: "What happens if a payment error occurs?" },
  { role: "assistant", content: "Show support for payment errors" },
  { role: "user", content: "can I get refunded if cannot travel?" },
  { role: "assistant", content: "Refund policy" },
];

type InjectedDependencies = AutoflowContainer & {
  openAiService: ILLMInterface;
  searchService: ISearchService;
};

/*
 * Simple retrieve-then-read implementation, using the AI Search and OpenAI APIs directly.
 * It first retrieves top documents from search, then constructs a prompt with them, and then uses
 * OpenAI to generate an completion (answer) with that prompt.
 */
export default class ChatReadRetrieveRead implements IChatApproach {
  identifier = ApproachDefinitions.CHAT_RETRIEVE_READ;
  private openaiService_: ILLMInterface;
  private searchService_: ISearchService;

  constructor(container: InjectedDependencies) {
    this.openaiService_ = container.openAiService;
    this.searchService_ = container.searchService;
  }

  // export interface SearchResult {
  //   choices?: Array<{
  //     index: number;
  //     message: SearchResultMessage;
  //   }>;
  //   hits: IndexableDocChunk[];
  //   object: 'chat.completion';
  // }

  async run(messages: Message[], context?: ChatContext): Promise<ChatResponse> {
    // const { completionRequest, thoughts } = await this.baseRun(
    //   messages,
    //   context
    // );
    // let hits = [];
    // const chatCompletion = await this.openaiService_.completeChat(
    //   completionRequest.messages
    // );
    // return {
    //   // choices: [
    //   //   {
    //   //     index: 0,
    //   //     message: {
    //   //       content: chatCompletion,
    //   //       role: 'assistant',
    //   //       context: {
    //   //         data_points: hits,
    //   //         thoughts: thoughts,
    //   //       },
    //   //     },
    //   //   },
    //   // ],
    //   message: {
    //     role: "assistant",
    //     content: chatCompletion,
    //   },
    //   data_points: hits,
    // };
    return {} as ChatResponse;
  }

  async *runWithStreaming(
    messages: Message[],
    context?: ChatContext
  ): AsyncGenerator<ChatResponseChunk, void> {
    const { completionRequest, hits, thoughts } = await this.baseRun(messages, context);
    const chatCompletion = await this.openaiService_.completeChatWithStreaming(
      completionRequest.messages
    );
    let id = 0;
    for await (const chunk of chatCompletion) {
      const responseChunk = {
        choices: [
          {
            index: 0,
            delta: {
              content: chunk ?? '',
              role: 'assistant' as const,
              context: {
                data_points: id === 0 ? { points: hits } : undefined,
                thoughts: id === 0 ? thoughts : undefined,
              },
            },
          },
        ],
      };
      yield responseChunk;
      id++;
    }
  }

  private async baseRun(messages: Message[], context?: SearchContext) {
    const userQuery =
      "Generate a search query for: " + messages[messages.length - 1].content;

    // STEP 1: Generate an optimized keyword search query based on the chat history and the last question
    const initialMessages: Message[] = this.getMessagesFromHistory(
      QUERY_PROMPT_TEMPLATE,
      messages,
      userQuery,
      [],
      this.openaiService_.getTokenLimit() - userQuery.length
    );


    const chatCompletion = await this.openaiService_.completeChat(
      initialMessages
    );
    
    
    let queryText = chatCompletion.trim();
    let metadata;
    if (queryText === "0") {
      // Use the last user input if we failed to generate a better query
      queryText = messages[messages.length - 1].content;
    }
    else{
      metadata = JSON.parse(queryText);
      queryText = metadata.search_query;
    }

    // STEP 2: Retrieve relevant documents from the search index with the GPT optimized query
    // -----------------------------------------------------------------------
    
    let hits = await this.searchService_.searchChunks(null,  queryText, context);
    hits = hits.filter((doc) => doc !== undefined);
    const sources = hits.map((c) => c.content).join("\n");

    const followUpQuestionsPrompt = context?.suggest_followup_questions
      ? FOLLOW_UP_QUESTIONS_PROMPT_CONTENT
      : " ";

    // STEP 3: Generate a contextual and content specific answer using the search results and chat history
    // -----------------------------------------------------------------------

    // Allow client to replace the entire prompt, or to inject into the exiting prompt using >>>
    const promptOverride = context?.prompt_template;
    let systemMessage: string;
    if (promptOverride?.startsWith(">>>")) {
      systemMessage = SYSTEM_MESSAGE_CHAT_CONVERSATION.replace(
        "{follow_up_questions_prompt}",
        followUpQuestionsPrompt
      ).replace("{injected_prompt}", promptOverride.slice(3) + "\n");
    } else if (promptOverride) {
      systemMessage = SYSTEM_MESSAGE_CHAT_CONVERSATION.replace(
        "{follow_up_questions_prompt}",
        followUpQuestionsPrompt
      ).replace("{injected_prompt}", promptOverride);
    } else {
      systemMessage = SYSTEM_MESSAGE_CHAT_CONVERSATION.replace(
        "{follow_up_questions_prompt}",
        followUpQuestionsPrompt
      ).replace("{injected_prompt}", "");
    }
  
    const finalMessages = this.getMessagesFromHistory(
      systemMessage,
      messages,
      // Model does not handle lengthy system messages well.
      // Moving sources to latest user conversation to solve follow up questions prompt.
      `${messages[messages.length - 1].content}\n\nSources:\n${sources===''?'NO SOURCES AVAILABLE':sources}`,
      [],
      this.openaiService_.getTokenLimit()
    );

    // const firstQuery = MessageBuilder.messagesToString(initialMessages);
    // const secondQuery = MessageBuilder.messagesToString(finalMessages);
    
    // const thoughts =
    //   `Search query:
    //   ${queryText} 
      
    //   Conversations: ${firstQuery} ${secondQuery}`.replace(
    //     '\n',
    //     "<br>"
    //   );

    // temperature: Number(context?.temperature ?? 0.7),
    return {
      completionRequest: {
        messages: finalMessages,
      },
      thoughts:"",
      hits: hits as SearchChunk[],
    };
  }

  private getMessagesFromHistory(
    systemPrompt: string,
    history: Message[],
    userContent: string,
    fewShots: Message[] = [],
    maxTokens = 4096
  ): Message[] {
    const messageBuilder = new MessageBuilder(
      systemPrompt,
      this.openaiService_.getChatModelTokenCount(systemPrompt)
    );

    // Add examples to show the chat what responses we want.
    // It will try to mimic any responses and make sure they match the rules laid out in the system message.
    for (const shot of fewShots.reverse()) {
      messageBuilder.appendMessage(
        shot.role,
        shot.content,
        1,
        this.openaiService_.getChatModelTokenCount(shot.content)
      );
    }

    const appendIndex = fewShots.length + 1;
    messageBuilder.appendMessage(
      "user",
      userContent,
      appendIndex,
      this.openaiService_.getChatModelTokenCount(userContent)
    );

    for (const historyMessage of history.slice(0, -1).reverse()) {
      if (messageBuilder.tokens > maxTokens) {
        break;
      }
      if (
        historyMessage.role === "assistant" ||
        historyMessage.role === "user"
      ) {
        messageBuilder.appendMessage(
          historyMessage.role,
          historyMessage.content,
          appendIndex,
          this.openaiService_.getChatModelTokenCount(historyMessage.content)
        );
      }
    }

    return messageBuilder.messages;
  }

}
