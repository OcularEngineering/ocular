'use client';

import Image from "next/image";
import React, { useEffect, useContext } from 'react';
import SectionContainer from '@/components/section-container';
import AddWebsiteDialog from './add-website-dialog';
import { ApplicationContext } from "@/context/context";
import api from '@/services/admin-api';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default function WebConnector({ appId }: { appId: string }) {
  const { addedWebsitesLinks, setAddedWebsitesLinks } = useContext(ApplicationContext);

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
          setAddedWebsitesLinks(appMetadata.links || []);
        }
      } catch (error) {
        console.error('Failed to fetch integration details', error);
      }
    };
    fetchApp();
  }, [appId]);

  if (!addedWebsitesLinks) {
    return <div>Loading...</div>;
  }

  return (
    <SectionContainer className="items-center justify-center space-y-5 mt-10">
      <AddWebsiteDialog appId={appId} />
      <div className="rounded-2xl border hide-scrollbar flex flex-col">
        <Table>
          <TableHeader className='rounded-tl-2xl rounded-tr-2xl'>
            <TableRow>
              <TableHead className="text-sm font-semibold text-gray-800 dark:text-white">Website</TableHead>
              <TableHead className="text-sm font-semibold text-gray-800 dark:text-white">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {addedWebsitesLinks.length > 0 ? (
              addedWebsitesLinks.map((website) => (
                <TableRow key={website.id}>
                  <TableCell className='flex flex-row gap-5'>
                    <div style={{ width: '20px', height: '20px' }}>
                      <Image src={"/web-connector.svg"} alt={"Web Image"} width={20} height={20} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800 dark:text-white">
                        {website.title ? website.title : website.location}
                      </p>
                      <p className="font-regular line-clamp-3 text-sm text-gray-500">
                        {website.description}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm font-semibold text-gray-500 dark:text-white">
                      {website.status}
                    </p>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow className='items-center justify-center'>
                <TableCell colSpan={2}>
                  <div className='flex flex-col items-center justify-center gap-5'>
                    <p>You haven&apos;t added any website Links</p>
                    <AddWebsiteDialog appId={appId} />
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </SectionContainer>
  );
}
