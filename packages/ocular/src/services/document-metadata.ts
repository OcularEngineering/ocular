import {
  Logger,
  TransactionBaseService,
  CreateDocumentMetadataInput,
  IndexableDocument,
} from "@ocular/types";
import { DocumentMetadata } from "../models/document-metadata";
import { EntityManager } from "typeorm";
import { DocumentMetadataRepository } from "../repositories";
import { User } from "../models";
import { Selector } from "../types/common";
import { AutoflowAiError, AutoflowAiErrorTypes } from "@ocular/utils";
import { buildQuery } from "../utils/build-query";
import { In } from "typeorm";

type InjectedDependencies = {
  logger: Logger;
  documentMetadataRepository: typeof DocumentMetadataRepository;
  loggedInUser: User;
};

class DocumentMetadataService extends TransactionBaseService {
  protected readonly documentMetadataRepository_: typeof DocumentMetadataRepository;
  protected readonly loggedInUser_: User;

  constructor(
    { logger, documentMetadataRepository }: InjectedDependencies,
    config
  ) {
    // eslint-disable-next-line prefer-rest-params
    super(arguments[0]);
    this.documentMetadataRepository_ = documentMetadataRepository;
  }

  async create(
    document: CreateDocumentMetadataInput
  ): Promise<DocumentMetadata> {
    return await this.atomicPhase_(
      async (transactionManager: EntityManager) => {
        const documentMetadataRepository = transactionManager.withRepository(
          this.documentMetadataRepository_
        );
        const createdDocument = this.documentMetadataRepository_.create({
          ...document,
          organisation_id: this.loggedInUser_.organisation_id,
        });
        const newDocument = await documentMetadataRepository.save(
          createdDocument
        );
        return newDocument;
      }
    );
  }

  // TODO: Implement Update Document
  async batchCreateOrUpdate(
    documents: IndexableDocument[]
  ): Promise<DocumentMetadata[]> {
    return await this.atomicPhase_(
      async (transactionManager: EntityManager) => {
        const documentRepository = transactionManager.withRepository(
          this.documentMetadataRepository_
        );
        // Get Existing Documents From The Database Based On The IDs.
        const allDocIds = documents.map((doc) => doc.id);

        const existingDocuments = await documentRepository.find({
          where: { id: In(allDocIds) },
        });
        // TODO: Update Existing Documents If Updated At Is Greater Than The Existing Document

        // New Documents Metadata To Be Created In The Database
        const existingIds = existingDocuments.map((doc) => doc.id);
        const newDocuments = documents.filter(
          (doc) => !existingIds.includes(doc.id)
        );

        // Create New Documents
        const createdDocuments = newDocuments.map((doc) =>
          documentRepository.create({
            id: doc.id,
            title: doc.title,
            link: "doc.link" + doc.id,
            type: doc.type,
            source: doc.source,
            organisation_id: doc.organisationId,
            updated_at: new Date(),
          })
        );
        const newCreatedDocuments = await documentRepository.save(
          createdDocuments
        );
        return newCreatedDocuments;
      }
    );
  }

  // async retrieveById(id: string): Promise<DocumentMetadata> {
  //   const documentRepo = this.activeManager_.withRepository(this.documentRepository_)
  //   const doc = await documentRepo.findOne({
  //     where: { id: id}
  //   })
  //   return doc
  // }

  async list(
    selector: Selector<DocumentMetadata>
  ): Promise<DocumentMetadata[]> {
    const metadataRepo = this.activeManager_.withRepository(
      this.documentMetadataRepository_
    );
    const query = buildQuery(selector, {});
    return await metadataRepo.find(query);
  }

  async listByIds(ids: string[]): Promise<DocumentMetadata[]> {
    return await this.atomicPhase_(
      async (transactionManager: EntityManager) => {
        const documentMetadataRepository = transactionManager.withRepository(
          this.documentMetadataRepository_
        );
        const documents = await documentMetadataRepository.find({
          where: { id: In(ids) },
        });
        return documents;
      }
    );
  }
}

export default DocumentMetadataService;
