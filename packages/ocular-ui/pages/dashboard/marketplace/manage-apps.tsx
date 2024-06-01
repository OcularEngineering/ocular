'use client';

import SectionContainer from '@/components/section-container';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import api from '@/services/admin-api';
import {
  ColumnDef,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import * as React from 'react';
import Image from 'next/image';
import { formatLabel } from '@/lib/utils';

// Define the App type
export type App = {
  id: string;
  name: string;
};

// Define the columns for the apps table
export const columns: ColumnDef<App>[] = [
  {
    accessorKey: 'name',
    header: 'App Name',
    cell: ({ row }) => (
      <div className="flex items-center">
        <Image
            src={`/${row.original.name}.svg`}
            alt={`${row.original.name} logo`}
            className="w-6 h-6 mr-2"
            width={24}
            height={24}
        />
        <div>{formatLabel(row.getValue('name'))}</div>
      </div>
    ),
  },
  {
    accessorKey: 'id',
    header: 'App ID',
    cell: ({ row }) => <div>{row.getValue('id')}</div>,
  },
];

export default function ManageApps() {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [appData, setAppData] = React.useState<App[]>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  React.useEffect(() => {
    async function fetchApps() {
      try {
        const response = await api.apps.listInstalled();
        if (response.status === 200) {
          const apps = response.data.apps;
          console.log('Installed apps:', apps);
          setAppData(apps);
        } else {
          console.error('Failed to fetch installed apps');
        }
      } catch (error) {
        console.error('Error fetching integrations:', error);
      }
    }
    fetchApps();
  }, []);

  const table = useReactTable({
    data: appData,
    columns,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <SectionContainer className="items-center justify-center space-y-16 my-20">
      <div className="rounded-2xl border hide-scrollbar flex flex-col">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody className="overflow-y-auto">
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </SectionContainer>
  );
}
