import IntegrationTileGrid from '@/components/marketplace/integration-tile-grid';
import SectionContainer from '@/components/section-container';
import { siteConfig } from '@/config/site';
import api from '@/services/admin-api';
import { Integration } from '@/types/types';
import { Metadata } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { useDebounce } from 'use-debounce';

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
  icons: {
    icon: '/Ocular-Profile-Logo.png',
    shortcut: '/Ocular-Profile-Logo.png',
    apple: '/Ocular-Profile-Logo.png',
  },
};

interface IntegrationsByCategory {
  [key: string]: Integration[];
}

function BrowseAppsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [allIntegrations, setAllIntegrations] = useState<Integration[]>([]);
  const [search, setSearch] = useState('');
  const [debouncedSearchTerm] = useDebounce(search, 300);
  const [isSearching, setIsSearching] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchIntegrations = async () => {
      setIsSearching(true);
      try {
        const response = await api.apps.list();
        if (response && response.data.apps) {
          setAllIntegrations(response.data.apps);
          setIntegrations(response.data.apps);
          console.log("Integrations: ", response.data.apps)
        }
      } catch (error) {
        console.error('Error fetching integrations:', error);
      }
      setIsSearching(false);
    };

    fetchIntegrations();
  }, []);

  useEffect(() => {
    const filterIntegrations = () => {
      if (!debouncedSearchTerm.trim()) {
        setIntegrations(allIntegrations);
        return;
      }

      const filtered = allIntegrations.filter(
        (integration) =>
          integration.name
            .toLowerCase()
            .includes(debouncedSearchTerm.toLowerCase()) ||
          integration.category
            .toLowerCase()
            .includes(debouncedSearchTerm.toLowerCase()) ||
          integration.description
            .toLowerCase()
            .includes(debouncedSearchTerm.toLowerCase())
        // Add any other fields you want to include in the search
      );

      setIntegrations(filtered);
    };

    filterIntegrations();
  }, [debouncedSearchTerm, allIntegrations]);

  const allCategories = Array.from(
    new Set(integrations.map((integration) => integration.category))
  );

  const integrationsByCategory = integrations.reduce<IntegrationsByCategory>(
    (acc, integration) => {
      const { category } = integration;
      if (!acc[category]) acc[category] = [];
      acc[category].push(integration);
      return acc;
    },
    {}
  );

  return (
    <div>
      <Head>
        <title>
          {metadata.title.default} | Ocular AI Marketplace
        </title>
        <meta name="description" content={metadata.description}></meta>
        <link rel="icon" href="/Ocular-Profile-Logo.png" />
      </Head>
      <SectionContainer className=" space-y-10 mb-10">
        <div className="flex flex-col items-center justify-center space-y-5">
          <div className="dark:bg-transparent md:dark:hover:border-gray-100 mt-5 flex w-full max-w-md items-center  rounded-full border bg-white  px-5 py-2 focus-within:shadow hover:shadow sm:max-w-xl sm:py-3 md:hover:border-white lg:max-w-4xl">
            {/* <IconSearch className="mr-3 h-6 text-gray-600 " /> */}
            <input
              type="text"
              className="dark:bg-transparent custom-input w-full grow focus:outline-none"
              placeholder="Search integrations or categories "
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        {/* Title */}
        <div className="grid space-y-12 md:gap-8 lg:grid-cols-12 lg:gap-16 lg:space-y-0 xl:gap-16">
          <div className="lg:col-span-4 xl:col-span-3">
            {/* Horizontal link menu */}
            <div className="space-y-5">
              <div className="hidden space-y-5 lg:block">
                <h3 className="text-scale-1100 group-hover:text-scale-1200 font-semibold mb-2 text-xl transition-colors">
                  Categories
                </h3>
                <div className="space-y-5">
                  {allCategories.map((category) => (
                    <button
                      key={category}
                      onClick={() => router.push(`#${category.toLowerCase()}`)}
                      className="text-scale-1100 block text-base"
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="lg:col-span-8 xl:col-span-9">
            {/* Partner Tiles */}
            <div className="grid space-y-10">
              {integrations.length ? (
                <IntegrationTileGrid
                  integrationsByCategory={integrationsByCategory}
                />
              ) : (
                <h2 className="h1 font-heading">
                  Integration or category not found
                </h2>
              )}
            </div>
          </div>
        </div>
      </SectionContainer>
    </div>
  );
}

export default BrowseAppsPage;
