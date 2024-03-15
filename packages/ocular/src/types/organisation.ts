import { Organisation } from "../models/organisation"
import { PartialPick } from "../types/common"
import { InstalledApp } from "@ocular/types"

export interface CreateOrganisationInput {
  name?: string
}

export type FilterableOrganisationProps = PartialPick<
  Organisation,
  | "name"
>


export type UpdateOrganisationInput = {
  installed_apps?: InstalledApp[]
}