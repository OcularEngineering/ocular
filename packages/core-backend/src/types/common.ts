import "reflect-metadata"
import { FindManyOptions, FindOneOptions, FindOptionsOrder, FindOptionsRelations, FindOptionsSelect, FindOptionsWhere } from "typeorm"

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