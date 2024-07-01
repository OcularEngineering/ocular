import { Router } from "express"

import middlewares, {
  transformBody,
  transformQuery,
} from "../../../middlewares"
import { GetPublishableApiKeysParams } from "./list-publishable-api-keys"
import { PublishableApiKey } from "../../../../models"
import { DeleteResponse, PaginatedResponse } from "../../../../types/common"
import { AdminPostPublishableApiKeysReq } from "./create-publishable-api-keys"
import { AdminPostPublishableApiKeysPublishableApiKeyReq } from "./update-publishable-api-keys"

const route = Router()

export default (app) => {
  app.use("/publishable-api-keys", route)

  route.post(
    "/",
    transformBody(AdminPostPublishableApiKeysReq),
    middlewares.wrap(require("./create-publishable-api-key").default)
  )

  route.get(
    "/:id",
    middlewares.wrap(require("./get-publishable-api-key").default)
  )

  route.post(
    "/:id",
    transformBody(AdminPostPublishableApiKeysPublishableApiKeyReq),
    middlewares.wrap(require("./update-publishable-api-key").default)
  )

  route.delete(
    "/:id",
    middlewares.wrap(require("./delete-publishable-api-key").default)
  )

  route.post(
    "/:id/revoke",
    middlewares.wrap(require("./revoke-publishable-api-key").default)
  )

  route.get(
    "/",
    transformQuery(GetPublishableApiKeysParams, {
      isList: true,
    }),
    middlewares.wrap(require("./list-publishable-api-keys").default)
  )
}

/**
 * @schema AdminPublishableApiKeysRes
 * type: object
 * required:
 *   - publishable_api_key
 * properties:
 *   publishable_api_key:
 *     $ref: "#/components/schemas/PublishableApiKey"
 */
export type AdminPublishableApiKeysRes = {
  publishable_api_key: PublishableApiKey
}

/**
 * @schema AdminPublishableApiKeysListRes
 * type: object
 * required:
 *   - publishable_api_keys
 *   - count
 *   - offset
 *   - limit
 * properties:
 *   publishable_api_keys:
 *     type: array
 *     items:
 *       $ref: "#/components/schemas/PublishableApiKey"
 *   count:
 *     type: integer
 *     description: The total number of items available
 *   offset:
 *     type: integer
 *     description: The number of items skipped before these items
 *   limit:
 *     type: integer
 *     description: The number of items per page
 */
export type AdminPublishableApiKeysListRes = PaginatedResponse & {
  publishable_api_keys: PublishableApiKey[]
}

/**
 * @schema AdminPublishableApiKeyDeleteRes
 * type: object
 * required:
 *   - id
 *   - object
 *   - deleted
 * properties:
 *   id:
 *     type: string
 *     description: The ID of the deleted PublishableApiKey.
 *   object:
 *     type: string
 *     description: The type of the object that was deleted.
 *     default: publishable_api_key
 *   deleted:
 *     type: boolean
 *     description: Whether the PublishableApiKeys was deleted.
 *     default: true
 */
export type AdminPublishableApiKeyDeleteRes = DeleteResponse

export * from "./list-publishable-api-keys"
export * from "./create-publishable-api-keys"
export * from "./update-publishable-api-keys"