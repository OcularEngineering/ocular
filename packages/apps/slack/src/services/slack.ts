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
    this.logger_.info(`Starting oculation of Slack for ${org.id} organisation`);

    // Get Slack auth for the organisation
    const auth = await this.appAuthorizationService_.retrieve({
      id: org.id,
      app_name: AppNameDefinitions.SLACK,
    });

    if (!auth) {
      this.logger_.error(`No Slack auth found for ${org.id} organisation`);
      return;
    }

    const config: ApiConfig = {
      headers: {
        Authorization: `Bearer ${auth.token}`,
        Accept: "application/json",
      },
    };

    let documents: IndexableDocument[] = [];

    try {
      const slackChannels = await this.fetchSlackChannels(config);
      for (const channel of slackChannels) {
        const conversations = await this.fetchChannelConversations(
          channel.id,
          config
        );
        for (const conversation of conversations) {
          const thread = await this.fetchThreadForConversation(
            channel.id,
            conversation.id,
            config
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
          if (documents.length >= 100) {
            yield documents;
            documents = [];
          }
        }
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

  async fetchSlackChannels(config: ApiConfig) {
    // Block Until Rate Limit Allows Request
    await this.requestQueue_.removeTokens(1, AppNameDefinitions.SLACK);
    try {
      const response = await axios.get(
        "https://slack.com/api/conversations.list",
        config
      );

      if (!response.data) {
        return [];
      }

      const channels = response.data.channels;
      return channels;
    } catch (error) {
      this.logger_.error(
        "Error fetching Slack Channels in fetchSlackChannels:",
        error
      );
      throw error;
    }
  }

  async fetchChannelConversations(channelID: string, config: ApiConfig) {
    try {
      // Block Until Rate Limit Allows Request
      await this.requestQueue_.removeTokens(1, AppNameDefinitions.SLACK);
      const conversationsEndpoint = `https://slack.com/api/conversations.history?channel=${channelID}`;
      const response = await axios.get(conversationsEndpoint, config);
      const conversationsArray = response.data.messages || [];
      const conversations = conversationsArray.map((conversations) => ({
        id: conversations.ts,
        text: conversations.text,
        user: conversations.user,
      }));
      return conversations;
    } catch (error) {
      throw new Error("Failed to fetch channel conversation.");
    }
  }

  async fetchThreadForConversation(
    channelID: string,
    tsID: string,
    config: ApiConfig
  ) {
    try {
      // Block Until Rate Limit Allows Request
      await this.requestQueue_.removeTokens(1, AppNameDefinitions.SLACK);
      const threadsEndpoint = `https://slack.com/api/conversations.replies?channel_id=${channelID}&ts=${tsID}`;
      const response = await axios.get(threadsEndpoint, config);
      return response.data.messages;
    } catch (error) {
      throw new Error("Failed to fetch channel conversation.");
    }
  }
}
