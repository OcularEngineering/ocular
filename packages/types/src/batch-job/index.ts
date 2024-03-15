import { Type } from "class-transformer"
import {
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator"
import { Transform } from "class-transformer"
import { DateComparisonOperator } from "@ocular/utils"
import  {IsType}  from "@ocular/utils"

export enum BatchJobStatus {
  CREATED = "created",
  PRE_PROCESSED = "pre_processed",
  CONFIRMED = "confirmed",
  PROCESSING = "processing",
  COMPLETED = "completed",
  CANCELED = "canceled",
  FAILED = "failed",
}


type result =  {
  count?: number
  advancement_count?: number
  progress?: number
  errors?: (BatchJobResultError | string)[]
  stat_descriptors?: BatchJobResultStatDescriptor[]
  file_key?: string
  file_size?: number
} & Record<string, unknown>



export type CreateBatchJobInput = {
  type: string
  context: Record<string, unknown>
  dry_run: boolean
}

export type BatchJobResultError = {
  message: string
  code: string | number
  [key: string]: unknown
}

export type BatchJobResultStatDescriptor = {
  key: string
  name: string
  message: string
}

export class FilterableBatchJobProps {
  @IsOptional()
  @IsType([String, [String]])
  id?: string | string[]

  @IsOptional()
  @IsEnum(BatchJobStatus, { each: true })
  status?: BatchJobStatus[]

  @IsArray()
  @IsOptional()
  type?: string[]

  @IsString()
  @IsOptional()
  @IsType([String, [String]])
  created_by?: string | string[]

  @IsOptional()
  @ValidateNested()
  @Type(() => DateComparisonOperator)
  created_at?: DateComparisonOperator

  @IsOptional()
  @ValidateNested()
  @Type(() => DateComparisonOperator)
  updated_at?: DateComparisonOperator
}

export type BatchJobUpdateProps = {
  context?: Record<string, unknown>
  result?: result
  dry_run?: boolean
}

export type BatchJobCreateProps = {
  type: string
  context?: Record<string, unknown>
  result?: result
  dry_run?: boolean
}

