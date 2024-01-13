import { IEventBusService, ISearchService } from "../types"
import { defaultSearchIndexingProductRelations, indexTypes } from "../utils/search"
import { SEARCH_INDEX_EVENT } from "../loaders/search"
import OrganisationService from "../services/organisation"
import { UserService } from "../services"
import { User } from "../models"

type InjectedDependencies = {
  eventBusService: IEventBusService
  searchService: ISearchService
  organisationService: OrganisationService
  userService: UserService
}

class SearchIndexingSubscriber {
  private readonly eventBusService_: IEventBusService
  private readonly searchService_: ISearchService
  private readonly organisationService_: OrganisationService
  private readonly userService_: UserService

  constructor({
    eventBusService,
    searchService,
    organisationService,
    userService,
  }: InjectedDependencies) {
    this.eventBusService_ = eventBusService
    this.searchService_ = searchService
    this.organisationService_ = organisationService
    this.userService_ = userService

    this.eventBusService_.subscribe(SEARCH_INDEX_EVENT, this.indexOrganisationUsers)
  }

  indexOrganisationUsers = async (): Promise<void> => {
    const users = await this.userService_.list({})
    if(users) {
      await this.searchService_.addDocuments(
        UserService.IndexName,
        users,
        indexTypes.USERS
      )
   }
    
    // const TAKE = (this.searchService_?.options?.batch_size as number) ?? 1000
    // let hasMore = true

    // let lastSeenId = ""

    // while (hasMore) {
    //   const users = await this.retrieveNextUsers(lastSeenId, TAKE)

    //   if (users.length > 0) {
    //     await this.searchService_.addDocuments(
    //       UserService.IndexName,
    //       users,
    //       indexTypes.users
    //     )
    //     lastSeenId = users[users.length - 1].id
    //   } else {
    //     hasMore = false
    //   }
    // }
  }

  protected async retrieveNextUsers(
    lastSeenId: string,
    take: number
  ): Promise<User[]> {
    const relations = [...defaultSearchIndexingProductRelations]

    return await this.userService_.list({})

    // return await this.userService_.list(
    //   { id: { gt: lastSeenId } },
    //   {
    //     relations,
    //     take: take,
    //     order: { id: "ASC" },
    //   }
    // )
  }
}

export default SearchIndexingSubscriber
