
"use client"

import { Row } from "@tanstack/react-table"
import { Separator } from "@/components/ui/separator"

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface DataTableRowActionsProps<TData> {
  row: Row<TData>
}

export function DataTableRowActions<TData>({
  row,
}: DataTableRowActionsProps<TData>) {

  return (
    <Select>
      <SelectTrigger className="w-[130px]">
        <SelectValue placeholder="Select a type" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem value="Admin">Team Admin</SelectItem>
          <SelectItem value="Member">Member</SelectItem>
          <Separator/>
          <SelectItem value="Remove">
            <span style={{ color: 'red' }}>Remove from team</span>
          </SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
