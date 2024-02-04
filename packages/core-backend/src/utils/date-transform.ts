import { isDate } from "@ocular-ai/utils"

export const transformDate = ({ value }): Date => {
  return isDate(value) ? new Date(value) : new Date(Number(value) * 1000)
}

export const transformOptionalDate = ({ value }) => {
  return !isDate(value) ? value : transformDate({ value })
}