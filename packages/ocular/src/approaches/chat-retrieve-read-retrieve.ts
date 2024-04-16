import { EntityManager } from "typeorm";
import { AutoflowContainer , ApproachDefinitions, SearchResultChunk, ISearchService, ILLMInterface, SearchResult, SearchContext, Message, IChatApproach, ChatContext, ChatResponse } from "@ocular/types";
import { MessageBuilder } from "../utils/message";
import { IndexableDocChunk } from "@ocular/types";

const SYSTEM_MESSAGE_CHAT_CONVERSATION = `Assistant helps Employees At Ocular answer questions about work. Be brief in your answers.
Answer ONLY with the facts listed in the list of sources below. If there isn't enough information below, say you don't know. Do not generate answers that don't use the sources below. If asking a clarifying question to the user would help, ask the question.
For tabular information return it as an html table. Do not return markdown format. If the question is not in English, answer in the language used in the question.

Each source has a name followed by colon and the actual information, always include the source name for each fact you use in the response. Use square brackets to reference the source, for example: [info1.txt]. Don't combine sources, list each source separately, for example: [info1.txt][info2.pdf].
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

const QUERY_PROMPT_TEMPLATE = `Below is a history of the conversation so far, and a new question asked by the user that needs to be answered by searching in a knowledge base about terms of service, privacy policy, and questions about support requests.
Generate a search query based on the conversation and the new question.
Do not include cited source filenames and document names e.g info.txt or doc.pdf in the search query terms.
Do not include any text inside [] or <<>> in the search query terms.
Do not include any special characters like '+'.
If the question is not in English, translate the question to English before generating the search query.
If you cannot generate a search query, return just the number 0.
`;

const QUERY_PROMPT_FEW_SHOTS: Message[] = [
  { role: 'user', content: 'What happens if a payment error occurs?' },
  { role: 'assistant', content: 'Show support for payment errors' },
  { role: 'user', content: 'can I get refunded if cannot travel?' },
  { role: 'assistant', content: 'Refund policy' },
];

type InjectedDependencies = AutoflowContainer & {
  openAiService: ILLMInterface,
  searchService: ISearchService,
}

/**
 * Simple retrieve-then-read implementation, using the AI Search and OpenAI APIs directly.
 * It first retrieves top documents from search, then constructs a prompt with them, and then uses
 * OpenAI to generate an completion (answer) with that prompt.
 */
export default class ChatReadRetrieveRead implements IChatApproach {
  identifier = ApproachDefinitions.ASK_RETRIEVE_READ;
  private openaiService_: ILLMInterface;
  private searchService_: ISearchService;

  constructor(container: InjectedDependencies) {
    this.openaiService_= container.openAiService;
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
    const { completionRequest, thoughts, hits } = await this.baseRun(messages, context);
    const chatCompletion = await this.openaiService_.completeChat(completionRequest.messages);
    return {
      // choices: [
      //   {
      //     index: 0,
      //     message: {
      //       content: chatCompletion,
      //       role: 'assistant',
      //       context: {
      //         data_points: hits,
      //         thoughts: thoughts,
      //       },
      //     },
      //   },
      // ],
      message: {
        role: 'assistant',
        content: chatCompletion,
      },
      data_points: hits,
    };
  }

  async *runWithStreaming(messages: Message[], context?: SearchContext): AsyncGenerator<SearchResultChunk, void> {
    // const { completionRequest, dataPoints, thoughts } = await this.baseRun(messages, context);
    // const openAiChat = await this.openai.calculateTokens();
    // const chatCompletion = await openAiChat.completions.create({
    //   ...completionRequest,
    //   stream: true,
    // });
    // let id = 0;
    // for await (const chunk of chatCompletion) {
    //   const responseChunk = {
    //     choices: [
    //       {
    //         index: 0,
    //         delta: {
    //           content: chunk.choices[0].delta.content ?? '',
    //           role: 'assistant' as const,
    //           context: {
    //             data_points: id === 0 ? { text: dataPoints } : undefined,
    //             thoughts: id === 0 ? thoughts : undefined,
    //           },
    //         },
    //         finish_reason: chunk.choices[0].finish_reason,
    //       },
    //     ],
    //     object: 'chat.completion.chunk' as const,
    //   };
    //   yield responseChunk;
    //   id++;
    // }
  }

  private async baseRun(messages: Message[], context?: SearchContext) {
    const userQuery = 'Generate a search query for: ' + messages[messages.length - 1].content;

    // STEP 1: Generate an optimized keyword search query based on the chat history and the last question
    const initialMessages: Message[] = this.getMessagesFromHistory(
      QUERY_PROMPT_TEMPLATE,
      messages,
      userQuery,
      QUERY_PROMPT_FEW_SHOTS,
      this.openaiService_.getTokenLimit() - userQuery.length,
    );
   
    const chatCompletion = await this.openaiService_.completeChat(initialMessages);

    let queryText = chatCompletion.trim();
    if (queryText === '0') {
      // Use the last user input if we failed to generate a better query
      queryText = messages[messages.length - 1].content;
    }

    // STEP 2: Retrieve relevant documents from the search index with the GPT optimized query
    // -----------------------------------------------------------------------


    let hits = await this.searchService_.search(null, queryText, context);

    hits = hits.filter(doc => doc !== null);
    console.log("Found Docs", hits)
    const sources = hits.map((c) => c.content).join(', ');

    const followUpQuestionsPrompt = context?.suggest_followup_questions ? FOLLOW_UP_QUESTIONS_PROMPT_CONTENT : '';

    // STEP 3: Generate a contextual and content specific answer using the search results and chat history
    // -----------------------------------------------------------------------

    // Allow client to replace the entire prompt, or to inject into the exiting prompt using >>>
    const promptOverride = context?.prompt_template;
    let systemMessage: string;
    if (promptOverride?.startsWith('>>>')) {
      systemMessage = SYSTEM_MESSAGE_CHAT_CONVERSATION.replace(
        '{follow_up_questions_prompt}',
        followUpQuestionsPrompt,
      ).replace('{injected_prompt}', promptOverride.slice(3) + '\n');
    } else if (promptOverride) {
      systemMessage = SYSTEM_MESSAGE_CHAT_CONVERSATION.replace(
        '{follow_up_questions_prompt}',
        followUpQuestionsPrompt,
      ).replace('{injected_prompt}', promptOverride);
    } else {
      systemMessage = SYSTEM_MESSAGE_CHAT_CONVERSATION.replace(
        '{follow_up_questions_prompt}',
        followUpQuestionsPrompt,
      ).replace('{injected_prompt}', '');
    }

    const finalMessages = this.getMessagesFromHistory(
      systemMessage,
      messages,
      // Model does not handle lengthy system messages well.
      // Moving sources to latest user conversation to solve follow up questions prompt.
      `${messages[messages.length - 1].content}\n\nSources:\n${sources}`,
      [],
      this.openaiService_.getTokenLimit()
    );

    const firstQuery = MessageBuilder.messagesToString(initialMessages);
    const secondQuery = MessageBuilder.messagesToString(finalMessages);
    const thoughts = `Search query:${queryText} Conversations: ${firstQuery} ${secondQuery}`.replace(/\n/g, '<br>');

    return {
      completionRequest: {
        messages: finalMessages,
        temperature: Number(context?.temperature ?? 0.7),
        max_tokens: 1024,
        n: 1,
      },
      thoughts,
      hits: hits as IndexableDocChunk[],
    };
  }

  private getMessagesFromHistory(
    systemPrompt: string,
    history: Message[],
    userContent: string,
    fewShots: Message[] = [],
    maxTokens = 4096,
  ): Message[] {
 
    const messageBuilder = new MessageBuilder(systemPrompt, this.openaiService_.getChatModelTokenCount(systemPrompt));

    // Add examples to show the chat what responses we want.
    // It will try to mimic any responses and make sure they match the rules laid out in the system message.
    for (const shot of fewShots.reverse()) {
      messageBuilder.appendMessage(shot.role, shot.content, 1, this.openaiService_.getChatModelTokenCount(shot.content));
    }

    const appendIndex = fewShots.length + 1;
    messageBuilder.appendMessage('user', userContent, appendIndex, this.openaiService_.getChatModelTokenCount(userContent));

    for (const historyMessage of history.slice(0, -1).reverse()) {
      if (messageBuilder.tokens > maxTokens) {
        break;
      }
      if (historyMessage.role === 'assistant' || historyMessage.role === 'user') {
        messageBuilder.appendMessage(historyMessage.role, historyMessage.content, appendIndex, this.openaiService_.getChatModelTokenCount(historyMessage.content));
      }
    }

    return messageBuilder.messages;
  }
}