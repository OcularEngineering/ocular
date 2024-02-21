"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Team } from "@/data/schema"
import { DataTableColumnHeader } from "./data-table-column-header"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { EditTeamDialog } from "./edit-team/edit-team-dialog"
import { Button } from "@/components/ui/button"
import { Trash2 } from 'lucide-react';

import api from "@/services/admin-api"

export const columns: ColumnDef<Team>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <div className="flex items-center">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
          className="translate-y-[2px]"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="translate-y-[2px]"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Teams" />
    ),
    cell: ({ row }) => {
      const team = row.original

      return (
        <div className="flex items-center space-x-4">
          <div className="space-y-2">
            <EditTeamDialog team={team} />
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "members",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Members" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate font-medium">
            <Badge variant="secondary">{row.getValue("members")}</Badge>
          </span>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Added on" />
    ),
    cell: ({ row }) => {
      const team = row.original

      return (
        <>
          <p>
              {
                new Date(team.created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' }) + ' ' +
                new Date(team.created_at).toLocaleTimeString()
              }
          </p>
        </>
      );
    },
  },
  {
    accessorKey: "updated_at",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Last updated" />
    ),
    cell: ({ row }) => {
      const team = row.original

      return (
        <>
          <p>
            {
              new Date(team.updated_at).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' }) + ' ' +
              new Date(team.updated_at).toLocaleTimeString()
            }
          </p>
        </>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const teamID = row.original.id
      return (
        <>
          <div className="flex items-center">
            <Button
              variant="ghost"
              className="flex h-8 w-8 p-0 data-[state=open]:bg-muted hover:bg-white hover:dark:bg-muted"
              onClick={() => api.teams.delete(teamID)}
            >
              <Trash2 className="h-4 w-4" style={{ color: 'red' }} />
              <span className="sr-only">Open menu</span>
            </Button>
          </div>
        </>
      )

    },
  },
]
