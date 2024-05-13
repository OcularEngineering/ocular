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
          Link
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="lowercase">{row.getValue('location')}</div>
    ),
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
    <>
      <div className="w-full p-4">
        <div className="flex items-center py-4 gap-2">
          <Input
            placeholder="Paste the Base URL link..."
            onChange={handleInputChange}
            className="max-w-sm"
          />
          <Button
            variant="default"
            className="h-10"
            onClick={() => saveLink(inputValue)}
          >
            Save
            <Plus className="ml-2 h-4 w-4" />
          </Button>
        </div>
        <div className="rounded-md border">
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
      </div>
    </>
  );
}
