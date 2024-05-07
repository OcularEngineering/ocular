import { Logger, TransactionBaseService, CreateDocumentMetadataInput, IndexableDocument  } from "@ocular/types";
import { DocumentMetadata } from "../models/document-metadata";
import { EntityManager } from "typeorm";
import { DocumentMetadataRepository } from "../repositories";
import { User } from "../models";
import { Selector } from "../types/common";
import { AutoflowAiError, AutoflowAiErrorTypes } from "@ocular/utils";
import { buildQuery } from "../utils/build-query";
import { In } from 'typeorm';

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

  async batchCreateOrUpdate(documents: IndexableDocument[]): Promise<DocumentMetadata[]> {
    return await this.atomicPhase_(
      async (transactionManager: EntityManager) => {
        const documentRepository = transactionManager.withRepository(
          this.documentRepository_
        )
        // Documents That Already Exist in the Database
        const links = documents.map((doc) => doc.link)
        const existingDocuments = await documentRepository.find({
          where: { link: In(links), organisation_id: this.loggedInUser_.organisation_id}
        })

        // TODO: Update Existing Documents If Updated At Is Greater Than The Existing Document

        // New Documents Metadata To Be Created In The Database
        const newDocuments = documents.filter((doc) => !existingDocuments.map((doc) => doc.link).includes(doc.link))
        const createdDocuments = newDocuments.map((doc) => documentRepository.create({...doc, organisation_id: this.loggedInUser_.organisation_id}))
        const newCreatedDocuments = await documentRepository.save(createdDocuments)
        return newCreatedDocuments
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