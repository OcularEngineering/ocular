import fs from "fs";
import axios from "axios";
import { Readable } from "stream";
import {
  App,
  AppAuthorizationService,
  Organisation,
  RateLimiterService,
} from "@ocular/ocular";
import {
  IndexableDocument,
  TransactionBaseService,
  Logger,
  AppNameDefinitions,
  Section,
  DocType,
  ApiConfig,
} from "@ocular/types";
import { ConfigModule } from "@ocular/ocular/src/types";
import { RateLimiterQueue } from "rate-limiter-flexible";
import { WebClient } from "@slack/web-api";

export default class SlackService extends TransactionBaseService {
  protected appAuthorizationService_: AppAuthorizationService;
  protected logger_: Logger;
  protected container_: ConfigModule;
  protected rateLimiterService_: RateLimiterService;
  protected requestQueue_: RateLimiterQueue;

  constructor(container) {
    super(arguments[0]);
    this.appAuthorizationService_ = container.appAuthorizationService;
    this.logger_ = container.logger;
    this.container_ = container;
    this.rateLimiterService_ = container.rateLimiterService;
    this.requestQueue_ = this.rateLimiterService_.getRequestQueue(
      AppNameDefinitions.SLACK
    );
  }

  async getSlackData(org: Organisation) {
    return Readable.from(this.getSlackChannelsAndConversations(org));
  }

  async *getSlackChannelsAndConversations(
    org: Organisation
  ): AsyncGenerator<IndexableDocument[]> {
    // Get Slack Auth for the organisation
    const auth = await this.appAuthorizationService_.retrieve({
      id: org.id,
      app_name: AppNameDefinitions.SLACK,
    });

    if (!auth) {
      this.logger_.error(
        `getSlackChannelsAndConversations: No Slack auth found for ${org.id} organisation`
      );
      return;
    }

    try {
      // Instantiate Slack Client
      const slackClient = new WebClient(auth.token);
      let documents: IndexableDocument[] = [];

      // Fetch All Public Slack Channels
      const slackChannels = await this.fetchSlackChannels(slackClient);
      for (const channel of slackChannels) {
        const channelMetadata = {
          id: channel.id,
          name: channel.name,
          purpose: channel.purpose.value,
          members: channel.num_members,
        };
        // Fetch All Conversations In A Slack Channel
        const conversations = await this.fetchChannelConversations(
          slackClient,
          channel.id,
          auth.last_sync
        );
        for (const conversation of conversations) {
          // Skip MessageType
          if (conversation.type !== "message") continue;
          const thread = await this.fetchThreadForConversation(
            slackClient,
            channel.id,
            conversation.ts
          );

          const conversationMetadata = {
            id: conversation.id,
            user: conversation.user,
          };

          const sections: Section[] = thread.map((message, index) => ({
            content: message.text,
            link: `https://slack.com/api/conversations.replies?channel_id=${channel.id}&ts=${conversation.id}`,
          }));
          const threadDoc: IndexableDocument = {
            id: `slack_${org.id}_${channel.id}_conv_${conversation.id}`, // conversation id
            organisationId: org.id,
            source: AppNameDefinitions.SLACK,
            title: conversation.text, // the main message which lead to conversation
            metadata: {
              channel: channelMetadata,
              conversation: conversationMetadata,
            }, // passing channel id just for top down reference
            sections: sections, // an array of messages in the specific conversation
            type: DocType.TXT,
            updatedAt: new Date(parseFloat(conversation.ts) * 1000),
          };
          documents.push(threadDoc);
          if (documents.length >= 100) {
            yield documents;
            documents = [];
          }
        }
        yield documents;
      }
      yield documents;
      await this.appAuthorizationService_.update(auth.id, {
        last_sync: new Date(),
      });
    } catch (error) {
      this.logger_.error(
        `getSlackChannelsAndConversations: Error fetching Slack data for ${org.id} organisation`,
        error
      );
    }
  }

  async fetchSlackChannels(slackClient: WebClient) {
    // Block Until Rate Limit Allows Request
    try {
      const response = await slackClient.conversations.list({
        types: "public_channel,private_channel",
      });
      if (!response) {
        return [];
      }
      const channels = response.channels;
      for (const channel of channels) {
        // Join All Discovered Slack Channels
        await slackClient.conversations.join({ channel: channel.id });
      }
      return channels;
    } catch (error) {
      this.logger_.error(
        "fetchSlackChannels: Error fetching Slack Channels in fetchSlackChannels",
        error
      );
    }
  }

  async fetchChannelConversations(
    slackClient: WebClient,
    channelID: string,
    lastSync: Date
  ) {
    try {
      let next_cursor = "";
      let conversations = [];
      while (next_cursor !== undefined) {
        // Block Until Rate Limit Allows Request
        await this.requestQueue_.removeTokens(1, AppNameDefinitions.SLACK);
        const conversationsResponse = await slackClient.conversations.history({
          channel: channelID,
          oldest: lastSync
            ? Math.floor(lastSync.getTime() / 1000).toString()
            : null,
          limit: 200,
          cursor: next_cursor,
        });
        const convos = conversationsResponse.messages.map((conversations) => ({
          id: conversations.client_msg_id,
          text: conversations.text,
          user: conversations.user,
          ts: conversations.ts,
          type: conversations.type,
        }));
        conversations.push(...convos);
        next_cursor = conversationsResponse.response_metadata.next_cursor;
      }
      return conversations;
    } catch (error) {
      this.logger_.error(
        "fetchChanneConversations: Failed to fetch channel conversation.",
        error.message
      );
      return [];
    }
  }

  async fetchThreadForConversation(
    slackClient: WebClient,
    channelID: string,
    tsID: string
  ) {
    try {
      // Block Until Rate Limit Allows Request
      let next_cursor = "";
      let messages = [];
      while (next_cursor !== undefined) {
        await this.requestQueue_.removeTokens(1, AppNameDefinitions.SLACK);
        const threads = await slackClient.conversations.replies({
          channel: channelID,
          ts: tsID,
          cursor: next_cursor,
        });
        messages.push(...threads.messages);
        next_cursor = threads.response_metadata.next_cursor;
      }
      return messages;
    } catch (error) {
      this.logger_.error(
        "fetchThreadsForConversation: Error fetching Slack thread",
        error.message
      );
      return [];
    }
  }
}
