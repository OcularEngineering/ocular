/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/jsx-no-undef */
'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { ArrowUpDown, ChevronDown, MoreHorizontal, Plus } from 'lucide-react';
import * as React from 'react';
import SectionContainer from '@/components/section-container';

export type Link = {
  location: string;
  status: 'processing' | 'success' | 'failed';
};

export const columns: ColumnDef<Link>[] = [
  {
    accessorKey: 'location',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          URL
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="lowercase">{row.getValue('location')}</div>
    ),
    meta: {
      showImage: true,
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue('status')}</div>
    ),
  },
];

export default function WebConnector({ links }: { links: Link[] }) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [linkData, setLinkdata] = React.useState<Link[]>(links);
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const [inputValue, setInputValue] = React.useState('');

  const handleInputChange = (event: any) => {
    setInputValue(event.target.value);
  };

  const saveLink = async (data: string) => {
    console.log('Function called with input:', data);
    try {
      // const resp = await api.apps.saveWebConnectorLink();
      // console.log('response', resp.data);
      const response = await api.apps.updateApp({
        link: data as string,
        name: 'webConnector' as string,
      });
      if (response.status === 200) {
        const updatedLinkData: Link[] = [
          ...linkData,
          {
            location: data,
            status: 'processing',
          },
        ];
        setLinkdata(updatedLinkData);
      } else {
        const updatedLinkData: Link[] = [
          ...linkData,
          {
            location: data,
            status: 'failed',
          },
        ];
        setLinkdata(updatedLinkData);
      }
    } catch (error) {
      console.error('Error fetching integrations:', error);
    }
  };

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

  return (
    <SectionContainer className="items-center justify-center space-y-16">
      <div className="w-full p-4">
        <div className="flex items-center py-4 gap-2">
          <Input
            placeholder="Paste URL here..."
            onChange={handleInputChange}
            className="max-w-sm rounded-full p-4 h-10"
          />
          <Button
            variant="default"
            className="h-10 rounded-full"
            onClick={() => saveLink(inputValue)}
          >
            Add URL
            <Plus className="ml-2 h-4 w-4" />
          </Button>
        </div>
        <div className="rounded-xl border">
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
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                  >
                    {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      <div className='flex flex-row gap-3 items-center'>
                        {cell.column.columnDef.meta?.showImage && (
                          <img src="/web-connector.svg" alt="Web Connector" />
                        )}
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </div>
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
                    No URLs added
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </SectionContainer>
  );
}
