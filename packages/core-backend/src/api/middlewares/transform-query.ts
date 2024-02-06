import { NextFunction, Request, Response } from "express"
import { ClassConstructor } from "../../types/global"
import { validator } from "../../utils/validator"
import { ValidatorOptions } from "class-validator"
import { default as normalizeQuery } from "./normalized-query"
import {
  prepareListQuery,
  prepareRetrieveQuery,
} from "../../utils/get-query-config"
import { BaseEntity } from "../../types/interfaces/models/base-entity"
import { FindConfig, QueryConfig, RequestQueryFields } from "../../types/common"
import { omit } from "lodash"
import { removeUndefinedProperties } from "../../utils"
import { buildSelects, objectToStringPath } from "@ocular-ai/utils"

/**
 * Middleware that transform the query input for the api end points
 * @param plainToClass
 * @param queryConfig
 * @param config
 */
export function transformQuery<
  T extends RequestQueryFields,
  TEntity extends BaseEntity
>(
  plainToClass: ClassConstructor<T>,
  queryConfig?: Omit<
    QueryConfig<TEntity>,
    "allowedRelations" | "allowedFields"
  >,
  config: ValidatorOptions = {}
): (req: Request, res: Response, next: NextFunction) => Promise<void> {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      normalizeQuery()(req, res, () => void 0)
      const validated: T = await validator<T, Record<string, unknown>>(
        plainToClass,
        req.query,
        config
      )
      req.validatedQuery = validated
      req.filterableFields = getFilterableFields(validated)
      req.allowedProperties = getAllowedProperties(
        validated,
        req.includes ?? {},
        queryConfig
      )
      attachListOrRetrieveConfig<TEntity>(req, queryConfig)

      next()
    } catch (e) {
      next(e)
    }
  }
}


/**
 * Omit the non filterable config from the validated object
 * @param obj
 */
function getFilterableFields<T extends RequestQueryFields>(obj: T): T {
  const result = omit(obj, [
    "limit",
    "offset",
    "expand",
    "fields",
    "order",
  ]) as T
  return removeUndefinedProperties(result)
}

/**
 * build and attach the `retrieveConfig` or `listConfig`
 * @param req
 * @param queryConfig
 */
function attachListOrRetrieveConfig<TEntity extends BaseEntity>(
  req: Request,
  queryConfig?: QueryConfig<TEntity>
) {
  const validated = req.validatedQuery
  if (queryConfig?.isList) {
    req.listConfig = prepareListQuery(
      validated,
      queryConfig
    ) as FindConfig<unknown>
  } else {
    req.retrieveConfig = prepareRetrieveQuery(
      validated,
      queryConfig
    ) as FindConfig<unknown>
  }
}

/**
 * Get the allowed properties for the query
 * @param validated
 * @param includesOptions
 * @param queryConfig
 */
function getAllowedProperties<TEntity extends BaseEntity>(
  validated: RequestQueryFields,
  includesOptions: Record<string, boolean>,
  queryConfig?: QueryConfig<TEntity>
): string[] {
  const allowed: (string | keyof TEntity)[] = []

  const includeKeys = Object.keys(includesOptions)
  const fields = validated.fields
    ? validated.fields?.split(",")
    : queryConfig?.defaultFields || []
  const expand =
    validated.expand || includeKeys.length
      ? [...(validated.expand?.split(",") || []), ...includeKeys]
      : queryConfig?.defaultRelations || []

  allowed.push(...fields, ...objectToStringPath(buildSelects(expand)))

  return allowed as string[]
}