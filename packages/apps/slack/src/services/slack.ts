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
      this.logger_.error(`No Slack auth found for ${org.id} organisation`);
      return;
    }

    try {
      // Instatiate the Slack client
      const slackClient = new WebClient(auth.token);

      let documents: IndexableDocument[] = [];
      const slackChannels = await this.fetchSlackChannels(slackClient);
      for (const channel of slackChannels) {
        // Fetch All Conversations In A Slack Channel
        const conversations = await this.fetchChannelConversations(
          slackClient,
          channel.id,
          auth.last_sync
        );
        console.log("All Convos:", conversations.length);

        for (const conversation of conversations) {
          const thread = await this.fetchThreadForConversation(
            slackClient,
            channel.id,
            conversation.id
          );

          const sections: Section[] = thread.map((message, index) => ({
            content: message.text,
            link: `https://slack.com/api/conversations.replies?channel_id=${channel.id}&ts=${conversation.id}`,
          }));
          const threadDoc: IndexableDocument = {
            id: conversation.id, // conversation id
            organisationId: org.id,
            source: AppNameDefinitions.SLACK,
            title: conversation.text, // the main message which lead to conversation
            metadata: {
              channel_id: channel.id,
              channel_name: channel.name,
            }, // passing channel id just for top down reference
            sections: sections, // an array of messages in the specific conversation
            type: DocType.TXT,
            updatedAt: new Date(Date.now()),
          };
          documents.push(threadDoc);
          console.log("Thread:", threadDoc);
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
      if (error.response && error.response.status === 401) {
        // Check if it's an unauthorized error
        this.logger_.info(`Refreshing Slack token for ${org.id} organisation`);

        // Refresh the token
        const authToken = await this.container_["slackOauth"].refreshToken(
          auth.refresh_token
        );

        // Update the auth record with the new token
        await this.appAuthorizationService_.update(auth.id, authToken);

        // Retry the request
        return this.getSlackChannelsAndConversations(org);
      } else {
        console.error(error);
      }
    }

    this.logger_.info(`Finished oculation of Slack for ${org.id} organisation`);
  }

  async fetchSlackChannels(slackClient: WebClient) {
    // Block Until Rate Limit Allows Request
    await this.requestQueue_.removeTokens(1, AppNameDefinitions.SLACK);
    try {
      const response = await slackClient.conversations.list();
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
        console.log("Next Cursor:", next_cursor, "Channel ID:", channelID);
        // Block Until Rate Limit Allows Request
        await this.requestQueue_.removeTokens(1, AppNameDefinitions.SLACK);

        // Get Messages From Slack Channel After Last Sync Date
        const conversationsResponse = await slackClient.conversations.history({
          channel: channelID,
          oldest: lastSync
            ? Math.floor(lastSync.getTime() / 1000).toString()
            : null,
          limit: 10,
          cursor: next_cursor,
        });

        const convos = conversationsResponse.messages.map((conversations) => ({
          id: conversations.ts,
          text: conversations.text,
          user: conversations.user,
        }));
        conversations.push(...convos);
        console.log("Conversations:", conversationsResponse.response_metadata);
        next_cursor = conversationsResponse.response_metadata.next_cursor;
        console.log("Next Cursor:", next_cursor, "Channel ID:", channelID);
      }
      return conversations;
    } catch (error) {
      this.logger_.error(
        "Failed to fetch channel conversation.",
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
        console.log(
          "Next Cursor:",
          next_cursor,
          "Channel ID:",
          channelID,
          "TS ID:",
          tsID
        );
        await this.requestQueue_.removeTokens(1, AppNameDefinitions.SLACK);
        const threads = await slackClient.conversations.replies({
          channel: channelID,
          ts: tsID,
          cursor: next_cursor,
        });
        messages.push(...threads.messages);
        console.log(
          "Next Cursor:",
          threads.response_metadata.next_cursor,
          "Channel ID:",
          channelID,
          "TS ID:",
          tsID
        );
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
