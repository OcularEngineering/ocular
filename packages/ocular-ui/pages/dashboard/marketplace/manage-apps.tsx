'use client';

import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';
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
import Image from 'next/image';
import { formatLabel } from '@/lib/utils';
import { Button } from '@/components/ui/button';

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
        <ChevronRight
          className={`mr-2 h-4 transition-transform ${
            row.getIsExpanded() ? 'rotate-90' : ''
          }`}
        />
        <Image
          src={`/${row.original.name}.svg`}
          alt={`${row.original.name} logo`}
          className="w-6 h-6 mr-2"
          width={24}
          height={24}
        />
        <div className='text-md font-semibold'>{formatLabel(row.getValue('name'))}</div>
      </div>
    ),
  },
  // {
  //   accessorKey: 'id',
  //   header: 'App ID',
  //   cell: ({ row }) => <div>{row.getValue('id')}</div>,
  // },
];

export default function ManageApps() {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [appData, setAppData] = React.useState<App[]>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [expandedRow, setExpandedRow] = React.useState<string | null>(null);

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

  const handleRowClick = (rowId: string) => {
    setExpandedRow(expandedRow === rowId ? null : rowId);
  };

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
                <React.Fragment key={row.id}>
                  <TableRow
                    data-state={row.getIsSelected() && 'selected'}
                    onClick={() => handleRowClick(row.id)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {cell.id.includes('name') && (
                          <div className="flex items-center">
                            <ChevronRight
                              className={`mr-2 h-4 transition-transform ${
                                expandedRow === row.id ? 'rotate-90' : ''
                              }`}
                            />
                            <Image
                              src={`/${row.original.name}.svg`}
                              alt={`${row.original.name} logo`}
                              className="w-6 h-6 mr-2"
                              width={24}
                              height={24}
                            />
                            <div className="text-md font-semibold">
                              {formatLabel(row.getValue('name'))}
                            </div>
                          </div>
                        )}
                        {cell.id.includes('name') === false && (
                          flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                  {expandedRow === row.id && (
                    <TableRow>
                      <TableCell colSpan={columns.length}>
                        <div className="p-5 rounded-xl space-y-5">
                          <div className='space-x-5'>
                            <Button>Configure</Button>
                            <Button variant={"secondary"}>Uninstall</Button>
                          </div>
                          <p><strong>App ID:</strong> {row.original.id}</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
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
