"use client"

import { Table } from "@tanstack/react-table"
import { Input } from "@/components/ui/input"
import { InviteUserDialog } from "./invite-user-dialog"

interface DataTableToolbarProps<TData> {
  table: Table<TData>
}

export function DataTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="Search by name..."
          value={(table.getColumn("first_name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("first_name")?.setFilterValue(event.target.value)
          }
          className="h-8 w-[150px] bg-muted lg:w-[250px]"
        /> 
      </div>
      <InviteUserDialog />
    </div>
  )
}
