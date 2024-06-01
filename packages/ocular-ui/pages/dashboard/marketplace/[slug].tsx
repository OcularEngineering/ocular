import { marked } from 'marked';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { use, useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import Layout from '@/components/layout';
import WebConnector from '@/components/marketplace/webConnector';
import SectionContainer from '@/components/section-container';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { formatLabel } from '@/lib/utils';
import api from '@/services/admin-api';
import { Integration } from '@/types/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconChevronLeft, IconExternalLink } from '@supabase/ui';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

interface Link {
  id: string;
  location: string;
  status: 'processing' | 'success' | 'failed';
  title: string;
  description: string;
}

const formSchema = z.object({
  apiToken: z
    .string()
    .min(1, { message: 'API Token is required' })
    .describe('The API token for Integration of APP in Ocular'),
});

const OAUTHTOKEN = 'OAUTHTOKEN';
const WEBCONNECTOR = 'webConnector';

function Integrations() {
  const router = useRouter();
  let { slug, code, installation_id } = router.query;
  const [integration, setIntegration] = useState<Integration | null>(null);
  const [authorized, setAuthorized] = useState(false);
  const [links, setLinks] = useState<Link[] | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      apiToken: '',
    },
  });

  const authorizeApp = async (code: string) => {
    if (code == null) return; // If OAuth code is not present, return
    try {
      const response = await api.apps.authorizeApp({
        code: code as string,
        name: slug as string,
        installationId: installation_id,
      }); // Adjust this to match your actual API call
      if (response) {
        setAuthorized(true);
        router.push(`/dashboard/marketplace/${slug}`); // Redirect to the integration page
      }
    } catch (error) {
      console.error('Failed to authorize integration', error);
    }
  };

  async function formSubmit(values: z.infer<typeof formSchema>) {
    await authorizeApp(values.apiToken);
  }

  const addWebConnector = async () => {
    await authorizeApp('Fake Code');
  };

  useEffect(() => {
    const fetchIntegration = async () => {
      if (typeof slug !== 'string') return; // Make sure slug is a string
      try {
        const response = await api.apps.list(); // Adjust this to match your actual API call

        const fetchedIntegration = response.data.apps.find(
          (app: any) => app.name === slug
        );
        if (fetchedIntegration) {
          fetchedIntegration.overview = marked.parse(
            fetchedIntegration.overview
          ); // Parse markdown content
          setIntegration(fetchedIntegration);
        }
      } catch (error) {
        console.error('Failed to fetch integration details', error);
      }
    };

    const fetchApp = async () => {
      try {
        const response = await api.apps.retrieveApp({
          name: slug as string,
        });

        if (response) {
          const fetchedApp = response.data.app;
          const appMetadata = fetchedApp.metadata;

          switch (slug) {
            case WEBCONNECTOR:
              setLinks(appMetadata.links || []);
              break;

            default:
              break;
          }
        }
      } catch (error) {
        console.error('Failed to fetch integration details', error);
      }
    };

    fetchApp();
    fetchIntegration();
  }, [slug, authorized]);

  useEffect(() => {
    const listInstalled = async () => {
      try {
        const response = await api.apps.listInstalled(); // Adjust this to match your actual API call
        if (response) {
          const installed = response.data.apps.some(
            (app: any) => app.name === slug
          );
          setAuthorized(installed);
        }
      } catch (error) {
        console.error('Failed to get installed apps', error);
      }
    };
    listInstalled();
  }, [slug, authorized]);

  useEffect(() => {
    authorizeApp(code as string);
  }, [code, installation_id]);

  if (!integration) return <div>Loading...</div>;

  if (slug === WEBCONNECTOR && authorized) {
    if (!links) {
      return <div>Loading...</div>;
    }
    return <WebConnector links={links} />;
  }

  return (
    <>
      <Head>
        <title>{integration.name} | Ocular Integration Marketplace</title>
        <meta name="description" content={integration.description}></meta>
        <link rel="icon" href="/Ocular-Profile-Logo.png" />
      </Head>

      <Layout>
        <SectionContainer>
          {/* Integration details and UI components */}
          <div className="col-span-12 mx-auto mb-2 max-w-5xl space-y-12 lg:col-span-2">
            <Link href="/dashboard/marketplace" legacyBehavior>
              <a className="text-scale-1200 hover:text-scale-1000 flex cursor-pointer items-center transition-colors">
                <IconChevronLeft style={{ padding: 0 }} />
                Back to Integrations Marketplace
              </a>
            </Link>

            {/* Integration header with logo and name */}
            <div className="flex items-center justify-between space-x-4">
              <div className="flex items-center justify-center gap-5">
                <Image
                  src={integration.logo}
                  alt={integration.name}
                  width={56}
                  height={56}
                  className="bg-scale-400 size-14"
                />
                <h1 className="font-heading sm:text-2xl md:text-3xl">
                  {formatLabel(integration.name)}
                </h1>
              </div>

              {authorized ? (
                <Button disabled>Installed</Button>
              ) : (
                <div>
                  {integration.auth_strategy === OAUTHTOKEN && (
                    <div>
                      {slug === WEBCONNECTOR ? (
                        <Button onClick={addWebConnector}>
                          {' '}
                          Add {integration.name} for Ocular
                        </Button>
                      ) : (
                        <Link href={integration.oauth_url}>
                          <Button>Add {integration.name} for Ocular</Button>
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
            {/* Swiper for images */}
            <div className="flex flex-row gap-2 justify-center items-center w-full h-full">
              <Swiper
                className="flex-1 h-full w-full"
                initialSlide={0}
                spaceBetween={0}
                slidesPerView={4}
                speed={300}
                centerInsufficientSlides={true}
                breakpoints={{
                  320: { slidesPerView: 1 },
                  720: { slidesPerView: 2 },
                  920: { slidesPerView: 3 },
                  1024: { slidesPerView: 4 },
                  1208: { slidesPerView: 5 },
                }}
              >
                {integration.images.map((image, i) => (
                  <SwiperSlide key={i}>
                    <div className="relative cursor-move w-full h-full overflow-hidden rounded-md ">
                      <Image
                        src={image}
                        alt={integration.name}
                        layout="responsive"
                        width={1460}
                        height={960}
                        objectFit="contain"
                      />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
              {integration.auth_strategy === 'APITOKEN' && !authorized && (
                <div className="flex justify-center items-center w-full h-full m-2 flex-1">
                  <Card className="w-full max-w-3xl min-w-2xl p-4 border-0">
                    <CardContent>
                      <Form {...form}>
                        <form
                          onSubmit={form.handleSubmit(formSubmit)}
                          className="flex flex-col items-center space-y-8"
                        >
                          <div className="w-full">
                            <FormField
                              control={form.control}
                              name="apiToken"
                              render={({ field }) => (
                                <div className="flex flex-col space-y-3">
                                  <FormLabel>
                                    Service account API token
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="Enter your service account API token......"
                                      {...field}
                                      className="placeholder-gray-500"
                                    />
                                  </FormControl>
                                  <FormDescription>
                                    Make sure the token is of service account
                                  </FormDescription>
                                  <FormMessage />
                                </div>
                              )}
                            />
                          </div>
                          <Button type="submit" className="w-full mt-4">
                            Add {integration.name} for Ocular
                          </Button>
                        </form>
                      </Form>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>

            <div className="grid gap-3 space-y-16 lg:grid-cols-4 lg:space-y-0">
              <div className="lg:col-span-3">
                <h2
                  style={{ fontSize: '2rem', marginBottom: '1rem' }}
                  className="font-heading sm:text-2xl md:text-3xl lg:text-2xl"
                >
                  Overview
                </h2>

                <div
                  className="prose"
                  dangerouslySetInnerHTML={{ __html: integration.overview }}
                />
              </div>

              <div className="flex flex-col justify-center space-y-6">
                <h2
                  style={{ fontSize: '2rem', marginBottom: '1rem' }}
                  className="font-heading justify-start text-left sm:text-2xl md:text-3xl lg:text-2xl"
                >
                  Details
                </h2>

                <div className="text-scale-1200 space-y-3 divide-y">
                  <div className="flex items-center justify-between py-2">
                    <span className="text-scale-900 font-semibold">
                      Developer
                    </span>
                    <span className="text-scale-1200">
                      {integration.developer}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-2">
                    <span className="text-scale-900 font-semibold">
                      Category
                    </span>
                    <Link
                      href={`/integrations}#${integration.category.toLowerCase()}`}
                      legacyBehavior
                    >
                      <a className="text-brand-900 hover:text-brand-800 transition-colors">
                        {integration.category}
                      </a>
                    </Link>
                  </div>

                  <div className="flex items-center justify-between py-2">
                    <span className="text-scale-900 font-semibold">
                      Website
                    </span>
                    <a
                      href={integration.website}
                      target="_blank"
                      rel="noreferrer"
                      className="text-brand-900 hover:text-brand-800 transition-colors"
                    >
                      {new URL(integration.website).host}
                    </a>
                  </div>

                  <div className="flex items-center justify-between py-2">
                    <span className="text-scale-900 font-semibold">
                      Documentation
                    </span>
                    <a
                      href={integration.docs}
                      target="_blank"
                      rel="noreferrer"
                      className="text-brand-900 hover:text-brand-800 transition-colors"
                    >
                      <span className="flex items-center space-x-1">
                        <span>Learn</span>
                        <IconExternalLink size="small" />
                      </span>
                    </a>
                  </div>
                </div>
                {authorized ? (
                  <Button disabled>Installed</Button>
                ) : (
                  <div>
                    {integration.auth_strategy === OAUTHTOKEN && (
                      <div>
                        {slug === WEBCONNECTOR ? (
                          <Button onClick={addWebConnector}>
                            {' '}
                            Add {integration.name} for Ocular
                          </Button>
                        ) : (
                          <Link href={integration.oauth_url}>
                            <Button>Add {integration.name} for Ocular</Button>
                          </Link>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </SectionContainer>
      </Layout>
    </>
  );
}

export default Integrations;
