import fetch from 'node-fetch';
import { Readable } from 'stream';
import { OcularFactory } from '../types/ocular/interface';
import { IndexableDocument } from '../types/search';
import { ConfigModule, Logger } from '../types';
import { Organisation, User } from '../models';
import { AutoflowContainer } from '@ocular-ai/utils';
import { UserService } from '../services';
import { AppType } from '../types/apps';


/**
 * Extended IndexableDocument with explore tool specific properties
 *
 * @public
 */
// export interface ToolDocument extends IndexableDocument, ExploreTool {}

/**
 * The options for the {@link ToolDocumentCollatorFactory}.
 *
 * @public
 */
export type CoreBackendOcularFactoryOptions = {
  logger: Logger;
  userService: UserService
};

/**
 * Core Ocular responsible for exposing Core Backend data to the index.
 *
 * @public
 */
export class CoreBackendOcular implements OcularFactory {
  public readonly type: string = 'core-backend';

  private readonly logger_: Logger;
  private readonly userService_: UserService;

  private constructor(options: CoreBackendOcularFactoryOptions) {
    this.logger_ = options.logger;
    this.userService_ = options.userService;
  }

  static fromConfig(
    _config: ConfigModule,
    options: CoreBackendOcularFactoryOptions,
  ) {
    return new CoreBackendOcular(options);
  }

  async getOcular(organisation: Organisation) {
    return Readable.from(this.execute(organisation));
  }

  async *execute(organisation: Organisation): AsyncGenerator<IndexableDocument> {
    this.logger_.info(`Starting oculation of core users for ${organisation.id} organisation`);

    const users = await this.userService_.list({organisation_id: organisation.id},{});

    for (const user of users) {
      yield { 
          id: user.id,
          organisation_id: organisation.id,
          title: user.first_name + " " + user.last_name,
          source: AppType.CORE_BACKEND,
          content: [
            { text: user.email},
          ],
          updated_at: user.updated_at,
          location: "https://example.com",
      }
    }
    this.logger_.info('Finished oculation of core users');
  }
}