import { isDefined } from "../utils/is-defined"
import { EntityManager, FindOptionsWhere, ILike } from "typeorm"

import { TransactionBaseService } from "@ocular/types"
import { PublishableApiKey} from "../models"
import { PublishableApiKeyRepository } from "../repositories/publishable-api-key"
import { FindConfig, Selector } from "../types/common"
import {
  CreatePublishableApiKeyInput,
  UpdatePublishableApiKeyInput,
} from "../types/publishable-api-key"
import { isString,buildQuery } from "../utils"
import EventBusService from "./event-bus"

type InjectedDependencies = {
  manager: EntityManager

  eventBusService: EventBusService
  publishableApiKeyRepository: typeof PublishableApiKeyRepository
}

/**
 * A service for PublishableApiKey business logic.
 */
class PublishableApiKeyService extends TransactionBaseService {
  static Events = {
    CREATED: "publishable_api_key.created",
    REVOKED: "publishable_api_key.revoked",
  }

  protected readonly eventBusService_: EventBusService
  // eslint-disable-next-line max-len
  protected readonly publishableApiKeyRepository_: typeof PublishableApiKeyRepository

  constructor({
    eventBusService,
    publishableApiKeyRepository,
  }: InjectedDependencies) {
    // eslint-disable-next-line prefer-rest-params
    super(arguments[0])

    this.eventBusService_ = eventBusService
    this.publishableApiKeyRepository_ = publishableApiKeyRepository
  }

  /**
   * Create a PublishableApiKey record.
   *
   * @param data - partial data for creating the entity
   * @param context - key creation context object
   */
  async create(
    data: CreatePublishableApiKeyInput,
    context: {
      loggedInUserId: string
    }
  ): Promise<PublishableApiKey | never> {
    return await this.atomicPhase_(async (manager) => {
      const publishableApiKeyRepo = manager.withRepository(
        this.publishableApiKeyRepository_
      )

      const publishableApiKey = publishableApiKeyRepo.create({
        ...data,
        created_by: context.loggedInUserId,
      })

      await this.eventBusService_
        .withTransaction(manager)
        .emit(PublishableApiKeyService.Events.CREATED, {
          id: publishableApiKey.id,
        })

      return await publishableApiKeyRepo.save(publishableApiKey)
    })
  }

  /**
   * Retrieves a PublishableApiKey by id
   *
   * @param publishableApiKeyId - id of the key
   * @param config - a find config object
   */
  async retrieve(
    publishableApiKeyId: string,
    config: FindConfig<PublishableApiKey> = {}
  ): Promise<PublishableApiKey | never> {
    if (!isDefined(publishableApiKeyId)) {
      throw new Error(`PublishableApiKey Not defined`)      
    }

    return await this.retrieve_({ id: publishableApiKeyId }, config)
  }

  /**
   * Generic retrieve for selecting PublishableApiKEys by different attributes.
   *
   * @param selector - a PublishableApiKey selector object
   * @param config - a find config object
   */
  protected async retrieve_(
    selector: Selector<PublishableApiKey>,
    config: FindConfig<PublishableApiKey> = {}
  ): Promise<PublishableApiKey | never> {
    const repo = this.activeManager_.withRepository(
      this.publishableApiKeyRepository_
    )

    const query = buildQuery(selector, config)
    query.relationLoadStrategy = "query"

    const publishableApiKey = await repo.findOne(query)

    if (!publishableApiKey) {
      const selectorConstraints = Object.entries(selector)
        .map((key, value) => `${key}: ${value}`)
        .join(", ")

      throw new Error(`Publishable key with ${selectorConstraints} was not found`)
    }

    return publishableApiKey
  }

  /**
   * Lists publishable API keys based on the provided parameters.
   *
   * @return an array containing publishable API keys and a total count of records that matches the query
   */
  async listAndCount(
    selector: Selector<PublishableApiKey> & { q?: string },
    config: FindConfig<PublishableApiKey> = {
      skip: 0,
      take: 20,
    }
  ): Promise<[PublishableApiKey[], number]> {
    const pubKeyRepo = this.activeManager_.withRepository(
      this.publishableApiKeyRepository_
    )

    let q
    if (isString(selector.q)) {
      q = selector.q
      delete selector.q
    }

    const query = buildQuery(selector, config)
    query.where = query.where as FindOptionsWhere<PublishableApiKey>

    if (q) {
      query.where.title = ILike(`%${q}%`)
    }

    return await pubKeyRepo.findAndCount(query)
  }

  async update(
    publishableApiKeyId: string,
    data: UpdatePublishableApiKeyInput
  ): Promise<PublishableApiKey> {
    {
      return await this.atomicPhase_(async (manager) => {
        const publishableApiKeyRepository = manager.withRepository(
          this.publishableApiKeyRepository_
        )

        const pubKey = await this.retrieve(publishableApiKeyId)

        for (const key of Object.keys(data)) {
          if (isDefined(data[key])) {
            pubKey[key] = data[key]
          }
        }

        return await publishableApiKeyRepository.save(pubKey)
      })
    }
  }

  /**
   * Delete Publishable API key.
   *
   * @param publishableApiKeyId - id of the key being deleted
   */
  async delete(publishableApiKeyId: string): Promise<void> {
    return await this.atomicPhase_(async (manager) => {
      const repo = manager.withRepository(this.publishableApiKeyRepository_)

      const publishableApiKey = await this.retrieve(publishableApiKeyId).catch()

      if (publishableApiKey) {
        await repo.remove(publishableApiKey)
      }
    })
  }

  /**
   * Revoke a PublishableApiKey
   *
   * @param publishableApiKeyId - id of the key
   * @param context - key revocation context object
   */
  async revoke(
    publishableApiKeyId: string,
    context: {
      loggedInUserId: string
    }
  ): Promise<void | never> {
    return await this.atomicPhase_(async (manager) => {
      const repo = manager.withRepository(this.publishableApiKeyRepository_)

      const pubKey = await this.retrieve(publishableApiKeyId)

      if (pubKey.revoked_at) {
        throw new Error(`PublishableApiKey has already been revoked.`)
      }

      pubKey.revoked_at = new Date()
      pubKey.revoked_by = context.loggedInUserId

      await repo.save(pubKey)

      await this.eventBusService_
        .withTransaction(manager)
        .emit(PublishableApiKeyService.Events.REVOKED, {
          id: pubKey.id,
        })
    })
  }

  /**
   * Check whether the key is active (i.e. haven't been revoked or deleted yet)
   *
   * @param publishableApiKeyId - id of the key
   */
  async isValid(publishableApiKeyId: string): Promise<boolean> {
    const pubKey = await this.retrieve(publishableApiKeyId)
    return pubKey.revoked_by === null
  }
}

export default PublishableApiKeyService
