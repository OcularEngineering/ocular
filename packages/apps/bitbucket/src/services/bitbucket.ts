import { Readable } from "stream";
import {
  AppAuthorizationService,
  Organisation,
  RateLimiterService,
} from "@ocular/ocular";
import {
  AppNameDefinitions,
  IndexableDocument,
  Logger,
  TransactionBaseService,
  AuthStrategy,
} from "@ocular/types";
import { ConfigModule } from "@ocular/ocular/src/types";
import { RateLimiterQueue } from "rate-limiter-flexible";
import ApiTokenService from "../utils/api-token-service"

export default class BitBucketService extends TransactionBaseService {
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
      AppNameDefinitions.BITBUCKET
    );
  }

  async getBitBucketData(org: Organisation) {
    return Readable.from(this.getBitBucketInformation(org));
  }

  async *getBitBucketInformation(
    org: Organisation
  ): AsyncGenerator<IndexableDocument[]> {
    try{
      this.logger_.info(
        `Starting oculation of BitBucket for ${org.id} organisation`
      );
  
      // Get BitBucket AuthToken for the organisation
      const auth = await this.appAuthorizationService_.retrieve({
        id: org.id,
        app_name: AppNameDefinitions.BITBUCKET,
      });
  
      if (!auth) {
        this.logger_.error(`No Bitbucket Auth found for ${org.id} organisation`);
        return;
      }

      let documents: IndexableDocument[] = [];

      if (auth.auth_strategy === AuthStrategy.API_TOKEN_STRATEGY) {
        const apiTokenService = new ApiTokenService(
          this.appAuthorizationService_,
          this.logger_,
          this.rateLimiterService_,
        );

        const projectIndexableDocs = await apiTokenService.bitbucketIndexDocs(org);

        for (const doc of projectIndexableDocs) {
          documents.push(doc);
          if (documents.length >= 100) {
            yield documents;
            documents = [];
          }
        }
        yield documents;
      }
    }
    catch(error){
      this.logger_.error(
        `getBitBucketInformation: Error fetching Bitbucket data for ${org.id} organisation: ${error}`
      );
    }
  }
}
