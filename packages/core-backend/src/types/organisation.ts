import { Organisation } from "../models/organisation"
import { PartialPick } from "../../../types/src/common/common"

export interface CreateOrganisationInput {
  name?: string
}

export type FilterableOrganisationProps = PartialPick<
  Organisation,
  | "name"
>