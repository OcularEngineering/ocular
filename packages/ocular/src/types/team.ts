import {
  IsArray,
  IsOptional,
  IsString,
} from "class-validator"

import { IsType } from "@ocular/utils"

export type CreateTeamInput = {
  name: string
  member_emails?: string[]
}

/**
 * Filters to apply on retrieved teams.
 */
export class FilterableTeamProps {
  /**
   * IDs to filter components by.
   */
  @IsOptional()
  @IsType([String, [String]])
  id?: string | string[]

  /**
   * Names to filter teams by.
   */
  @IsString()
  @IsOptional()
  name?: string

  /**
   * Description to filter teams by.
   */
  @IsString()
  @IsOptional()
  description?: string
}