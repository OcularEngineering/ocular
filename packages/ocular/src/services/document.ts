import { Logger, TransactionBaseService, CreateDocumentInput  } from "@ocular/types";
import { Document } from "../models/document";
import { EntityManager } from "typeorm";
import { DocumentRepository } from "../repositories";
import { User } from "../models";

type InjectedDependencies = {
  logger: Logger,
  documentRepository: typeof DocumentRepository
  loggedInUser: User
}

class DocumentService extends TransactionBaseService {

  protected readonly documentRepository_: typeof DocumentRepository
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

  async create(document: CreateDocumentInput): Promise<Document> {
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

  async retrieve(documentId: string): Promise<Document> {
    const documentRepo = this.activeManager_.withRepository(this.documentRepository_)
    const doc = await documentRepo.findOne({
      where: { id: documentId, organisation_id: this.loggedInUser_.organisation_id}
    })
    return doc
  }

  async update(documentId: string, document: Document): Promise<Document> {
    return  null
  }

  async list(): Promise<Document[]> {
    return []
  }
}

export default DocumentService