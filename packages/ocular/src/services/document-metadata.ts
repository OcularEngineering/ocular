import { Logger, TransactionBaseService, CreateDocumentMetadataInput  } from "@ocular/types";
import { DocumentMetadata } from "../models/document-metadata";
import { EntityManager } from "typeorm";
import { DocumentMetadataRepository } from "../repositories";
import { User } from "../models";
import { Selector } from "../types/common";
import { AutoflowAiError, AutoflowAiErrorTypes } from "@ocular/utils";
import { buildQuery } from "../utils/build-query";

type InjectedDependencies = {
  logger: Logger,
  documentRepository: typeof DocumentMetadataRepository
  loggedInUser: User
}

class DocumentService extends TransactionBaseService {

  protected readonly documentRepository_: typeof DocumentMetadataRepository
  protected readonly loggedInUser_: User

  constructor(
    { logger, documentRepository, loggedInUser}: InjectedDependencies,
    config,
  ) {
    // eslint-disable-next-line prefer-rest-params
    super(arguments[0])
    this.documentRepository_ = documentRepository
    this.loggedInUser_ = loggedInUser
  }

  async create(document: CreateDocumentMetadataInput): Promise<DocumentMetadata> {
    return await this.atomicPhase_(
      async (transactionManager: EntityManager) => {
        const documentRepository = transactionManager.withRepository(
          this.documentRepository_
        )
        const createdDocument = this.documentRepository_.create({...document, organisation_id: this.loggedInUser_.organisation_id})
        const newDocument = await documentRepository.save(createdDocument)
        return newDocument
      }
    )
  }

 
  async retrieveById(id: string): Promise<DocumentMetadata> {
    const documentRepo = this.activeManager_.withRepository(this.documentRepository_)
    const doc = await documentRepo.findOne({
      where: { id: id, organisation_id: this.loggedInUser_.organisation_id}
    })
    return doc
  }

  async retrieveByLink(link: string): Promise<DocumentMetadata> {
    const documentRepo = this.activeManager_.withRepository(this.documentRepository_)
    const doc = await documentRepo.findOne({
      where: { link: link, organisation_id: this.loggedInUser_.organisation_id}
    })
    return doc
  }

  async list(selector: Selector<DocumentMetadata>): Promise<DocumentMetadata[]> {
    if(!this.loggedInUser_ || !this.loggedInUser_.organisation){
      throw new AutoflowAiError(
        AutoflowAiErrorTypes.NOT_FOUND,
        `User must belong to an "organisation" so as to get components`
      )
    }
    const metadataRepo = this.activeManager_.withRepository(this.documentRepository_)
    selector["organisation_id"] = this.loggedInUser_.organisation_id
    const query = buildQuery(selector, {})
    return await metadataRepo.find(query)
  }
}

export default DocumentService