import { Organisation } from "../models/organisation"
import { PartialPick } from "../types/common"

export interface CreateOrganisationInput {
  name?: string
}

export type FilterableOrganisationProps = PartialPick<
  Organisation,
  | "name"
>