import "reflect-metadata"
import {   FindOperator,FindManyOptions, FindOneOptions, FindOptionsOrder, FindOptionsRelations, FindOptionsSelect, FindOptionsWhere } from "typeorm"
import { BaseEntity } from "@ocular/types/src/interfaces/models/base-entity"
import {
  IsDate,
  IsNumber,
  IsOptional,
  IsString,
} from "class-validator"
import { Transform, Type } from "class-transformer"
import { transformDate } from "@ocular/utils"

export interface FindConfig<Entity> {
  select?: (keyof Entity)[]
  skip?: number
  take?: number
  relations?: string[]
  order?: { [K: string]: "ASC" | "DESC" }
}

export type RequestQueryFields = {
  /**
   * {@inheritDoc FindParams.expand}
   */
  expand?: string
  /**
   * {@inheritDoc FindParams.fields}
   */
  fields?: string
  /**
   * {@inheritDoc FindPaginationParams.offset}
   */
  offset?: number
  /**
   * {@inheritDoc FindPaginationParams.limit}
   */
  limit?: number
  /**
   * The field to sort the data by. By default, the sort order is ascending. To change the order to descending, prefix the field name with `-`.
   */
  order?: string
}

export type Constructor<T> = new (...args: any[]) => T

export type ExtendedFindConfig<TEntity> = (
  | Omit<FindOneOptions<TEntity>, "where" | "relations" | "select">
  | Omit<FindManyOptions<TEntity>, "where" | "relations" | "select">
) & {
  select?: FindOptionsSelect<TEntity>
  relations?: FindOptionsRelations<TEntity>
  where: FindOptionsWhere<TEntity> | FindOptionsWhere<TEntity>[]
  order?: FindOptionsOrder<TEntity>
  skip?: number
  take?: number
}

export type PartialPick<T, K extends keyof T> = {
  [P in K]?: T[P]
}

export type QueryConfig<TEntity extends BaseEntity> = {
  defaultFields?: (keyof TEntity | string)[]
  defaultRelations?: string[]
  allowedFields?: string[]
  allowedRelations?: string[]
  defaultLimit?: number
  isList?: boolean
}

export type PaginatedResponse = { limit: number; offset: number; count: number }

export type DeleteResponse = {
  id: string
  object: string
  deleted: boolean
}

/**
 * Parameters that can be used to configure how data is retrieved.
 */
export class FindParams {
  /**
   * Comma-separated relations that should be expanded in the returned data.
   */
  @IsString()
  @IsOptional()
  expand?: string

  /**
   * Comma-separated fields that should be included in the returned data.
   */
  @IsString()
  @IsOptional()
  fields?: string
}

export class FindPaginationParams {
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  offset?: number = 0

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  limit?: number = 20
}

export function extendedFindParamsMixin({
  limit,
  offset,
}: {
  limit?: number
  offset?: number
} = {}): Constructor<FindParams & FindPaginationParams> {
  class FindExtendedPaginationParams extends FindParams {
    @IsNumber()
    @IsOptional()
    @Type(() => Number)
    offset?: number = offset ?? 0

    @IsNumber()
    @IsOptional()
    @Type(() => Number)
    limit?: number = limit ?? 20
  }

  return FindExtendedPaginationParams
}


type InnerSelector<TEntity> = {
  [key in keyof TEntity]?:
    | TEntity[key]
    | TEntity[key][]
    | StringComparisonOperator
    | NumericalComparisonOperator
    | FindOperator<TEntity[key][] | string | string[]>
}


export type Selector<TEntity> =
  | InnerSelector<TEntity>
  | InnerSelector<TEntity>[]

  /**
 * Fields used to apply flexible filters on dates.
 */


/**
 * Fields used to apply flexible filters on strings.
 */
export class StringComparisonOperator {
  /**
   * The filtered string must be less than this value.
   */
  @IsString()
  @IsOptional()
  lt?: string

  /**
   * The filtered string must be greater than this value.
   */
  @IsString()
  @IsOptional()
  gt?: string

  /**
   * The filtered string must be greater than or equal to this value.
   */
  @IsString()
  @IsOptional()
  gte?: string

  /**
   * The filtered string must be less than or equal to this value.
   */
  @IsString()
  @IsOptional()
  lte?: string

  /**
   * The filtered string must contain this value.
   */
  @IsString()
  @IsOptional()
  contains?: string

  /**
   * The filtered string must start with this value.
   */
  @IsString()
  @IsOptional()
  starts_with?: string

  /**
   * The filtered string must end with this value.
   */
  @IsString()
  @IsOptional()
  ends_with?: string
}

/**
 * Fields used to apply flexible filters on numbers.
 */
export class NumericalComparisonOperator {
  /**
   * The filtered number must be less than this value.
   */
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  lt?: number

  /**
   * The filtered number must be greater than this value.
   */
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  gt?: number

  /**
   * The filtered number must be greater than or equal to this value.
   */
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  gte?: number

  /**
   * The filtered number must be less than or equal to this value.
   */
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  lte?: number
}