"use client";

import { useForm } from 'react-hook-form';
import { useEffect, useContext, useState } from "react";
import { useRouter } from 'next/router';
import { buttonVariants, Button } from "@/components/ui/button";
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { WebConnectorLink } from '@/types/types';
import { z } from 'zod';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Textarea } from "@/components/ui/textarea";


import api from "@/services/admin-api";
import { ApplicationContext } from "@/context/context";

const formSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  link: z.string().url(),
});

export default function AddWebsiteDialog({ appId }: { appId: string }) {
  const router = useRouter();
  const [linkData, setLinkData] = useState<WebConnectorLink[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      link: '',
    },
  });

  async function formSubmit(values: z.infer<typeof formSchema>) {
    const { title, description, link } = values;

    try {
      const response = await api.apps.updateApp({
        metadata: {
          link,
          title,
          description,
        },
        name: 'web-connector',
        app_id: appId,
      });

      const updatedLinkData: WebConnectorLink[] = [
        ...linkData,
        {
          location: link,
          status: response.status === 200 ? 'processing' : 'failed',
        },
      ];
      setLinkData(updatedLinkData || []);
      setIsDialogOpen(false); // Close the dialog after successful form submission
    } catch (error) {
      console.error('Error fetching integrations:', error);
    }
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button onClick={() => setIsDialogOpen(true)} variant="outline" className="flex items-center gap-2 rounded-3xl">
          Add Website
        </Button>
      </DialogTrigger>
      <DialogContent className="flex flex-col w-[30vw] h-[55vh] max-h-[55vh] justify-between overflow-auto">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(formSubmit)}>
            <CardHeader>
              <CardTitle>Add Website</CardTitle>
              <CardDescription>
                Extract and index website data
              </CardDescription>
            </CardHeader>
            <CardContent className='flex flex-col justify-between space-y-[40px]'>
              <div className="flex flex-col space-y-5">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="E.g. Home Page (Optional)" {...field} />
                      </FormControl>
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
                        <Input placeholder="E.g. https://www.useocular.com" {...field} />
                      </FormControl>
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
                        <Textarea
                          placeholder="E.g. This is the home page of Ocular. (Optional)"
                          className="resize-none h-[180px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className='flex items-end justify-end'>
                <Button type="submit" variant="outline" className="flex items-center gap-2 rounded-3xl">
                    Add Website
                </Button>
              </div>
            </CardContent>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
