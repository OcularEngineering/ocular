import { Component} from "../models";
import {
  IsArray,
  IsOptional,
  IsString,
} from "class-validator"

import { IsType } from "../utils/is-type"

export type CreateComponentInput = Omit<Component, "id" | "organisation" | "organisation_id" | "created_at" | "updated_at" |"deleted_at">

/**
 * Filters to apply on retrieved products.
 */
export class FilterableComponentProps {
  /**
   * IDs to filter components by.
   */
  @IsOptional()
  @IsType([String, [String]])
  id?: string | string[]


  /**
   * Filter products by their associated organisation ID's.
   */
  @IsArray()
  @IsOptional()
  organisation_id?: string


  /**
   * Title to filter products by.
   */
  @IsString()
  @IsOptional()
  type?: string


  /**
   * Handle to filter products by.
   */
  @IsString()
  @IsOptional()
  name?: string

  /**
   * Description to filter products by.
   */
  @IsString()
  @IsOptional()
  description?: string
}