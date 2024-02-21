import { ColumnDef } from '@tanstack/react-table';
import { Team } from '@/data/schema';
import { DataTableColumnHeader } from './data-table-column-header';
import { Badge } from "@/components/ui/badge"

import { Checkbox } from "@/components/ui/checkbox"

interface TeamWithMembership extends Team {
  belongsToUser: string; 
}

export const columns: ColumnDef<TeamWithMembership>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <div className="flex items-center">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
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
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Teams" />
    ),
    cell: ({ row }) => {
      const team = row.original;

      return (
        <div className="flex items-center space-x-4">
          <div className="space-y-2">
            <p className="text-sm font-medium leading-none">{team.name}</p>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'members',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Members" />
    ),
    cell: ({ row }) => (
      <div className="flex space-x-2">
        <span className="max-w-[500px] truncate font-medium">
          <Badge variant="secondary">{row.getValue('members') || row.getValue('members') === 0 ? row.getValue('members') : 10}</Badge>
        </span>
      </div>
    ),
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Added on" />
    ),
    cell: ({ row }) => {
      const user = row.original

      return (
        <>
          <p>
            {new Date(user.created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
    },
  },

];

