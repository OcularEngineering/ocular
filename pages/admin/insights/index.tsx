import React from 'react';
import { Separator } from "@/components/ui/separator"
import SectionContainer from '@/components/section-container'
import SearchChart from './searches'; 
import Metrics from './metrics'; 
import IntegrationsBreakdown from './integrations';
import SearchesByRole from './searches-by-role';
import TopSearches from './top-searches';
import TrendingSearches from './trending-searches';

export const metadata = {
    title: "Insights",
    description: "Your organization insights.",
  }

function InsightsPage() {
  return (
    <>
      <div className="my-5 space-y-[40px] overflow-x-hidden">
        <div className="flex flex-col items-start justify-between space-y-[10px]">
          <h2 className="text-2xl font-bold tracking-tight mb-3">{metadata.title}</h2>
          <p className="text-sm text-gray-500">
            Last updated: 
            {
                ' ' + new Date().toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' }) 
            }
          </p>
          <Separator />
        </div>
        <SectionContainer>
            <div className='flex flex-col gap-5'>
                <div className='flex flex-col gap-5'>
                    <Metrics />
                    <SearchChart />
                </div>
                <div className="flex flex-row flex-grow gap-5 justify-between">
                    <IntegrationsBreakdown />
                    <SearchesByRole />
                </div>
                <div className="flex flex-row flex-grow gap-5 justify-between">
                    <TopSearches />
                    <TrendingSearches />
                </div>
            </div>
        </SectionContainer>
      </div>
    </>
  );
};

export default InsightsPage;


