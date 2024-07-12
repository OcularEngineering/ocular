import { BatchJobService, Organisation, EventBusService, QueueService } from "@ocular/ocular";
import BitBucketService from "../services/bitbucket";
import { APPS_INDEXING_TOPIC, Logger, AbstractBatchJobStrategy } from "@ocular/types";

export default class BitBucketStrategy extends AbstractBatchJobStrategy {
  static identifier = "bitbucket-indexing-strategy";
  static batchType = "bitbucket";
  protected batchJobService_: BatchJobService;
  protected logger_: Logger;
  protected bitbucketService_: BitBucketService;
  protected queueService_: QueueService;

  constructor(container) {
    super(arguments[0]);
    this.bitbucketService_ = container.bitbucketService;
    this.batchJobService_ = container.batchJobService;
    this.queueService_ = container.queueService;
    this.logger_ = container.logger;
  }

  async processJob(batchJobId: string): Promise<void> {
    const batchJob = await this.batchJobService_.retrieve(batchJobId);

    const org = batchJob.context?.org as Organisation

    const oculationBitbucketActivity = this.logger_.activity(
      `processJob: Oculating Bitbucket Data for organisation: ${org.id} name: ${org.name}`
    );

    const stream = await this.bitbucketService_.getBitBucketData(org);
    stream.on("data", (documents) => {
      this.queueService_.sendBatch(APPS_INDEXING_TOPIC, documents);
    });
    stream.on("end", () => {
      this.logger_.success(
        oculationBitbucketActivity,
        `processJob:Finished oculation of Bitbucket Data for ${org.id} organisation`
      );
    });
    stream.on("error", () => {
      this.logger_.error(
        oculationBitbucketActivity,
        `processJob:Error in oculation of Bitbucket Data for ${org.id} organisation`
      );
    });
  }

  buildTemplate(): Promise<string> {
    throw new Error("Method not implemented.");
  }
}
