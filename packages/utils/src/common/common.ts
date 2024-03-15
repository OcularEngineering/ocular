import {
  IsDate,
  IsNumber,
  IsOptional,
  IsString,
} from "class-validator"
import { Transform} from "class-transformer"
import { transformDate } from "./date-transform"

export type Constructor<T> = new (...args: any[]) => T

export class DateComparisonOperator {
  /**
   * The filtered date must be less than this value.
   */
  @IsOptional()
  @IsDate()
  @Transform(transformDate)
  lt?: Date

  /**
   * The filtered date must be greater than this value.
   */
  @IsOptional()
  @IsDate()
  @Transform(transformDate)
  gt?: Date

  /**
   * The filtered date must be greater than or equal to this value.
   */
  @IsOptional()
  @IsDate()
  @Transform(transformDate)
  gte?: Date

  /**
   * The filtered date must be less than or equal to this value.
   */
  @IsOptional()
  @IsDate()
  @Transform(transformDate)
  lte?: Date
}