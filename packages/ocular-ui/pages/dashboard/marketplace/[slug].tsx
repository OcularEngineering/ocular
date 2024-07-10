import 'swiper/css';
import ApiTokenCard from '@/components/marketplace/api-token-cards';
import WebConnector from '@/components/marketplace/web-connector/web-connector';
import SectionContainer from '@/components/section-container';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { formatLabel } from '@/lib/utils';
import api from '@/services/admin-api';
import { Integration, AuthStrategy, AppNameDefinitions } from '@/types/types';
import {
  ArrowUpRight,
  ChevronLeft,
  ExternalLink,
  InfoIcon,
} from 'lucide-react';
import { marked } from 'marked';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';

function Integrations() {
  const router = useRouter();
  let { slug, code, installation_id } = router.query;
  const [integration, setIntegration] = useState<Integration | null>(null);
  const [authorized, setAuthorized] = useState(false);
  const [appId, setAppId] = useState<string | null>(null);

  const authorizeApp = async (code: string, metadata?: any) => {
    if (code == null) return;

    try {
      const response = await api.apps.authorizeApp({
        code: code as string,
        name: slug as string,
        installationId: installation_id,
        metadata: metadata,
      });

      if (response) {
        setAuthorized(true);
        router.push(`/dashboard/marketplace/${slug}`);
      }
    } catch (error) {
      console.error('Failed to authorize integration', error);
    }
  };

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

    const listInstalled = async () => {
      try {
        const response = await api.apps.listInstalled(); // Adjust this to match your actual API call
        if (response) {
          const app = response.data.apps.find(
            (app: any) => app.app_name === slug
          );
          setAuthorized(app !== undefined);
          setAppId(app.id);
        }
      } catch (error) {
        console.error('Failed to get installed apps', error);
      }
    };

    listInstalled();
    fetchIntegration();
  }, [slug, authorized]);

  useEffect(() => {
    authorizeApp(code as string);
  }, [code, installation_id]);

  if (!integration) return <div>Loading...</div>;

  if (slug === AppNameDefinitions.WEBCONNECTOR && authorized) {
    if (!appId) {
      return <div>Loading...</div>;
    }
    return <WebConnector appId={appId} />;
  }

  return (
    <div className="items-center mt-10">
      <Head>
        <title>{integration.name} | Ocular Integrxation Marketplace</title>
        <meta name="description" content={integration.description}></meta>
        <link rel="icon" href="/Ocular-Profile-Logo.png" />
      </Head>
      <SectionContainer>
        {/* Integration details and UI components */}
        <div className="col-span-12 mx-auto mb-2 max-w-5xl space-y-12 lg:col-span-2">
          <Link href="/dashboard/marketplace" legacyBehavior>
            <a className="text-scale-1200 hover:text-scale-1000 flex cursor-pointer items-center transition-colors">
              <ChevronLeft style={{ padding: 0 }} />
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
                {integration.auth_strategy ===
                  AuthStrategy.OAUTH_TOKEN_STRATEGY && (
                  <div>
                    {slug === AppNameDefinitions.WEBCONNECTOR ? (
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
          {!authorized && (
            <Alert className="w-full bg-blue-100 border dark:bg-muted">
              <InfoIcon className="h-4 w-4" />
              <AlertDescription className="flex gap-2">
                You can follow the installation steps
                <Link
                  href={integration.website}
                  className="font-bold underline flex"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  here
                  <ArrowUpRight className="h-4 w-4 font-bold underline" />
                </Link>
                to add {integration.name} for Ocular.
              </AlertDescription>
            </Alert>
          )}
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

            {integration.auth_strategy === AuthStrategy.API_TOKEN_STRATEGY &&
              !authorized && (
                <ApiTokenCard
                  integration={integration}
                  authorizeApp={authorizeApp}
                />
              )}
          </div>

          <div className="grid gap-3 space-y-16 lg:grid-cols-5 lg:space-y-0">
            <div className="lg:col-span-3 p-2">
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

            <div className="flex flex-col justify-center space-y-6 lg:col-span-2 p-2">
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
                  <span className="text-scale-900 font-semibold">Category</span>
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
                  <span className="text-scale-900 font-semibold">Website</span>
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
                      <ExternalLink className="h-4" />
                    </span>
                  </a>
                </div>
              </div>
              {authorized ? (
                <Button disabled>Installed</Button>
              ) : (
                <div>
                  {integration.auth_strategy ===
                    AuthStrategy.OAUTH_TOKEN_STRATEGY && (
                    <div>
                      {slug === AppNameDefinitions.WEBCONNECTOR ? (
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
    </div>
  );
}

export default Integrations;
