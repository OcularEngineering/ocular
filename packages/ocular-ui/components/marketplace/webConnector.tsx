'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';;
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import api from '@/services/admin-api';
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
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import SectionContainer from '@/components/section-container';

export type Link = {
  location: string;
  status: 'processing' | 'success' | 'failed';
};

export const columns: ColumnDef<Link>[] = [
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

export default function WebConnector({ links }: { links: Link[] }) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [linkData, setLinkdata] = React.useState<Link[]>(links);
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      link: '',
    },
  });

  async function formSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    const { title, description, link } = values;

    try {
      const response = await api.apps.updateApp({
        metadata: {
          link,
          title,
          description,
        },
        name: 'webConnector' as string,
      });
      if (response.status === 200) {
        const updatedLinkData: Link[] = [
          ...linkData,
          {
            location: link,
            status: 'processing',
          },
        ];
        setLinkdata(updatedLinkData);
      } else {
        const updatedLinkData: Link[] = [
          ...linkData,
          {
            location: link,
            status: 'failed',
          },
        ];
        setLinkdata(updatedLinkData);
      }
    } catch (error) {
      console.error('Error fetching integrations:', error);
    }
  }

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
      <div className="flex-1">
        <Card className="w-full rounded-2xl">
          <CardHeader>
            <CardTitle>Web Connector</CardTitle>
            <CardDescription>
              Your Gateway to Efficient Web Data Extraction.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(formSubmit)}
                className="space-y-8"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mx-auto">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input placeholder="title..." {...field} />
                        </FormControl>
                        <FormDescription>
                          This title will be displayed publically referencing
                          the base URL
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Input placeholder="description..." {...field} />
                        </FormControl>
                        <FormDescription>
                          This is a short description about the data being
                          extracted
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="link"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Base URL</FormLabel>
                        <FormControl>
                          <Input placeholder="base url..." {...field} />
                        </FormControl>
                        <FormDescription>
                          This is the base URL from where the data will be
                          extracted and indexed.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="my-auto">
                    Submit
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>

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
