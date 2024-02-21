"use client"

import { Row } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"

interface DataTableRowActionsProps<TData> {
  row: Row<TData>
}

export function DataTableRowActions<TData>({
  row,
}: DataTableRowActionsProps<TData>) {

  return (
    <Button
      variant="outline"
      className="flex h-8 data-[state=open]:bg-muted"
    >
      Add to team
    </Button>

  )
}
