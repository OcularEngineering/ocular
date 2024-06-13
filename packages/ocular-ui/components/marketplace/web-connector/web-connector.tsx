'use client';

import SectionContainer from '@/components/section-container';
import AddWebsiteDialog from './add-website-dialog';
import { Button } from '@/components/ui/button';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import api from '@/services/admin-api';
import { WebConnectorLink } from '@/types/types';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

export const columns: ColumnDef<WebConnectorLink>[] = [
  {
    accessorKey: 'location',
    header: 'Link',
    cell: ({ row }) => <div>{row.getValue('location')}</div>,
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => <div>{row.getValue('status')}</div>,
  },
];

const formSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  link: z.string().url(),
});

export default function WebConnector({ appId }: { appId: string }) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [linkData, setLinkData] = useState<WebConnectorLink[]>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  useEffect(() => {
    const fetchApp = async () => {
      if (!appId) {
        return;
      }
      try {
        const response = await api.apps.retrieveApp(appId);
        if (response) {
          const fetchedApp = response.data.app;
          const appMetadata = fetchedApp.metadata;
          setLinkData(appMetadata.links || []);
        }
      } catch (error) {
        console.error('Failed to fetch integration details', error);
      }
    };

    fetchApp();
  }, [appId]);

  const table = useReactTable({
    data: linkData,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  if (!linkData) {
    return <div>Loading...</div>;
  }

  return (
    <SectionContainer className="items-center justify-center space-y-5 mt-10">
      <AddWebsiteDialog appId={appId} />
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
