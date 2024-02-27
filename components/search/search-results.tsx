import React, { useState } from 'react';
import { Button } from "@/components/ui/button"
import Image from 'next/image';
import {
  SparklesIcon,
  LinkIcon
} from "@heroicons/react/outline";

import PaginationButtons from "./pagination-buttons";
import AppFilterOptions from "./app-filter-options";


// Results Component
const Results = ({ results }) => (
  <div className="mt-5 w-3/5 items-start justify-start">
    {results.map((result: any, index: any) => (
      <div
        key={index}
        className="dark:shadow-3xl group mb-4 flex max-w-4xl rounded-lg px-3 py-4 text-xs shadow ring-2 ring-gray-200 sm:text-base sm:shadow-none sm:ring-0 dark:ring-1 dark:ring-[#303134]"
      >
        <Image src={result.document && result.document.source ? `/${result.document.source}.svg` : '/default.png'} alt={result.document.title} className="mr-4 size-[40px]" width={10} height={10} />
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
          <div>
            <a href={result.document.location}>
              <h3 className="text-l mb-2 truncate font-semibold text-blue-800 group-hover:underline dark:text-blue-400">
                {result.document.title.charAt(0).toUpperCase() + result.document.title.slice(1)}
              </h3>
            </a>
            <p className="font-regular line-clamp-3 text-sm" dangerouslySetInnerHTML={{ __html: result.document.location }}></p>
          </div>
          <div className='flex flex-row gap-1'>
            <Button 
              id="headerOption"
              variant={"outline"}
              // eslint-disable-next-line tailwindcss/no-contradicting-classname
              className="dark:bg-secondary-dark hover:dark:bg-secondary-dark box-border flex hidden h-10 min-w-10 cursor-pointer items-center justify-start rounded-full bg-gray-100 px-3 hover:bg-blue-100 hover:font-semibold hover:text-blue-500 group-hover:block"
              
            >
              <div className='font-regular flex flex-row items-center gap-1 text-sm'>
                <SparklesIcon className="size-4" />
                Summarize
              </div>
            </Button>
            {/* <CopilotSideDialog showSideSheet={showSideSheet} setShowSideSheet={setShowSideSheet} /> */}
            <Button 
              id="linkIcon"
              variant={"outline"}
              // eslint-disable-next-line tailwindcss/no-contradicting-classname
              className="dark:bg-secondary-dark hover:dark:bg-secondary-dark box-border flex hidden h-10 min-w-10 cursor-pointer items-center justify-start rounded-full bg-gray-100 px-3 text-sm hover:bg-blue-100 group-hover:block"
            >
              <div className='flex flex-row items-center gap-1'>
                < LinkIcon className="h-4 w-4 hover:text-blue-500" />
              </div>
            </Button>
          </div>
        </div>
      </div>
    ))}
    <PaginationButtons />
  </div>
);

// Results Filter Component
const ResultsFilter = ({ results }) => (
  <div className="mt-5 flex w-2/5 flex-col items-start justify-start">
    <div className="flex flex-col items-center">
      <p className="mt-5 text-sm text-gray-600 dark:text-gray-400">
        Found {results.searchInformation?.formattedTotalResults} results
      </p>
      <AppFilterOptions results={results.searchInformation?.formattedTotalResults} />
    </div>
  </div>
);

// Main Component
export default function SearchResults({ results }) {
  const [showSideSheet, setShowSideSheet] = useState(false);
  return (
    <div className="font-open-sans dark:bg-primary-dark mx-auto flex min-h-screen w-full flex-row gap-10 px-3 sm:pl-[5%] md:pl-[14%] lg:pl-52  dark:text-white" style={{background: 'linear-gradient(to bottom, rgba(0, 0, 255, 0.01) 10%, transparent)'}}>
      <Results results={results} />
      <ResultsFilter results={results} />
    </div>
  );
}


