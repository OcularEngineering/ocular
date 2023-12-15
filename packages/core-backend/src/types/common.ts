import "reflect-metadata"

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