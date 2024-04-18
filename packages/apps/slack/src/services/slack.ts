import fs from "fs";
import axios from "axios";
import { Readable } from "stream";
import { OAuthService, Organisation } from "@ocular/ocular";
import {
  IndexableDocument,
  TransactionBaseService,
  Logger,
  AppNameDefinitions,
} from "@ocular/types";
import { ConfigModule } from "@ocular/ocular/src/types";

interface Config {
  headers: {
    Authorization: string;
    Accept: string;
  };
}

export default class SlackService extends TransactionBaseService {
  protected oauthService_: OAuthService;
  protected logger_: Logger;
  protected container_: ConfigModule;

  constructor(container) {
    super(arguments[0]);
    this.oauthService_ = container.oauthService;
    this.logger_ = container.logger;
    this.container_ = container;
  }

  async getSlackData(org: Organisation) {
    return Readable.from(this.getSlackChannelsAndConversations(org));
  }

  async *getSlackChannelsAndConversations(
    org: Organisation
  ): AsyncGenerator<IndexableDocument[]> {
    this.logger_.info(`Starting oculation of Slack for ${org.id} organisation`);

    // Get Slack OAuth for the organisation
    const oauth = await this.oauthService_.retrieve({
      id: org.id,
      app_name: AppNameDefinitions.SLACK,
    });

    if (!oauth) {
      this.logger_.error(`No Jira OAuth found for ${org.id} organisation`);
      return;
    }

    const config: Config = {
      headers: {
        Authorization: `Bearer ${oauth.token}`,
        Accept: "application/json",
      },
    };

    let documents: IndexableDocument[] = [];

    try {
      const slackChannels = await this.fetchSlackChannels(config)

      for (const channel of slackChannels) {
        const issues = await this.fetchChannelConversations(channel.id,config);
        // TODO: store issues in documents
      }
      yield documents;
      await this.oauthService_.update(oauth.id, {
        last_sync: new Date(),
      });
    } catch (error) {
      if (error.response && error.response.status === 401) {
        // Check if it's an unauthorized error
        this.logger_.info(`Refreshing Slack token for ${org.id} organisation`);

        // Refresh the token
        const oauthToken = await this.container_["slackOauth"].refreshToken(
          oauth.refresh_token
        );

        // Update the OAuth record with the new token
        await this.oauthService_.update(oauth.id, oauthToken);

        // Retry the request
        return this.getSlackChannelsAndConversations(org);
      } else {
        console.error(error);
      }
    }

    this.logger_.info(`Finished oculation of Slack for ${org.id} organisation`);
  }

  async fetchSlackChannels(config:Config){
    try{
      const response = await axios.get(
        "https://slack.com/api/conversations.list",
        config
      )

      if (!response.data)  {
        return [];
      }

      const channels = response.data.channels.map((channel) => ({
        id: channel.id,
        name: channel.name,
      }));
      return channels
    }catch(error){
      this.logger_.error(
        "Error fetching Slack Channels in fetchSlackChannels:",
        error
      );
      throw error;
    }
  }

  async fetchChannelConversations(channelID ,config){
    try{
      const conversationsEndpoint = `https://slack.com/api/conversations.history?channel=${channelID}`
      const response = await axios.get(conversationsEndpoint,config)
      const conversationsArray = response.data.messages || []
      const conversations = conversationsArray.map((conversations)=>({
        id:conversations.id,
        text:conversations.text
      }))
      return conversations
    }catch(error){
      throw new Error("Failed to fetch channel conversation.");
    }
  }
}
