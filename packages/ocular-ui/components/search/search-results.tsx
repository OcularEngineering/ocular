import React, { useState } from 'react';
import Image from 'next/image';
import AppFilterOptions from "./app-filter-options";
import ReactMarkdown from 'react-markdown';
import { formatLabel } from '@/lib/utils';
import {
  ChevronDownIcon,
} from "@heroicons/react/outline";
import { Skeleton } from "@/components/ui/skeleton"

import { SearchCopilotSkeleton, SearchResultsSkeleton, SearchByAppFilterSkeleton } from '@/components/ui/skeletons';

export const AIResults = ({ content, ai_citations }) => {
  const [showResults, setShowResults] = useState(false);

  return (
    <div className="flex flex-col rounded-3xl py-4 max-w-6xl space-y-3 justify-start items-start">
      <div className="flex flex-row justify-start items-start w-full">
        <div className="flex items-center space-x-2 justify-start w-full">
          <Image src="/Ocular-logo-light.svg" alt="Ocular Copilot" className="size-[50px]" width={50} height={10} />
          <h1 className="font-semibold text-l">Copilot</h1>
        </div>
      </div>
      <ReactMarkdown className="font-regular text-md space-y-4 text-left">{content}</ReactMarkdown>
      <div className="mt-2 mb-3 text-left w-full">
        {ai_citations && ai_citations.length > 0 && (
          <button onClick={() => setShowResults(!showResults)} className="text-left">
            <div className="flex flex-row bg-blue-100/50 dark:bg-muted border border-input p-2 px-3 rounded-2xl text-sm items-center gap-2 justify-start">
              {ai_citations.length} sources
              <ChevronDownIcon className={`h-4 ${showResults ? 'rotate-180' : ''}`} />
            </div>
          </button>
        )}
        <div className={`flex flex-row space-x-5 mt-5 overflow-auto scrollbar-hide transition-all duration-300 ${showResults ? 'opacity-100 max-h-[1000px]' : 'opacity-0 max-h-0'} justify-start items-start w-full`}>
          {ai_citations && ai_citations.slice(0, 13).map((citation, index) => (
            <div
              className="bg-blue-100/50 dark:bg-muted border flex flex-row rounded-2xl p-4 text-xs sm:text-base w-[200px] flex-none justify-start items-start text-left"
              key={index}
            >
              <div className="space-y-1 overflow-hidden text-left w-full">
                <a href={citation.location} target="_blank" rel="noopener noreferrer" className="flex flex-row space-x-0 justify-start items-start text-left w-full">
                  <Image src={citation && citation.source === 'pagerduty' ? '/PagerDuty.png' : citation && citation.source ? `/${citation.source}.svg` : '/default.png'} alt={citation.title} className="mr-4 size-[20px]" width={10} height={10} />
                  <h3 className="text-sm mb-2 truncate font-semibold text-blue-800 group-hover:underline dark:text-blue-400">
                    {formatLabel(citation.source)}
                  </h3>
                </a>
                <p className="font-regular line-clamp-1 text-sm" dangerouslySetInnerHTML={{ __html: citation.content }}></p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Results Component
const Results = ({ results }) => (
  <>
    <div className="w-3/5 max-w-5xl items-start justify-start">
      {
        (results && results.length > 0) ? 
          results
            .filter(result => result.snippets && result.snippets.length > 0) // Filter out results without snippets
            .map((result, index) => (
              <div key={index}>
                <div
                  key={index}
                  className="group mb-4 flex max-w-4xl px-3 py-4 text-xs sm:text-base"
                >
                  {
                    result && result.documentMetadata.source === 'ocular-api'
                      ? <div className="overflow-hidden dark:bg-muted bg-gray-200 min-h-[40px] h-[40px] min-w-[40px] w-[40px] rounded-xl mr-4"/>
                      : <Image src={result && result.documentMetadata.source === 'pagerduty' ? '/PagerDuty.png' : result && result.documentMetadata.source ? `/${result.documentMetadata.source}.svg` : '/default.png'} 
                          alt={result.documentMetadata.title} 
                          className="mr-4 size-[40px]" 
                          width={10} 
                          height={10} 
                        />
                  }
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                    <div className='space-y-1'>
                      <a href={result.documentMetadata.link} target="_blank" rel="noopener noreferrer">
                        <h3 className="text-l mb-2 truncate font-semibold text-blue-800 group-hover:underline dark:text-blue-400">
                          {result.documentMetadata.title.charAt(0).toUpperCase() + result.documentMetadata.title.slice(1)}
                        </h3>
                      </a>
                      <p className="font-regular line-clamp-3 text-sm max-w-3xl w-[770px]" dangerouslySetInnerHTML={{ __html: result.snippets.map(snippet => snippet.content).join(" ... ") }}></p>
                      <div className='flex flex-row gap-2'>
                        <p className="font-regular line-clamp-3 text-sm text-gray-500">
                        {
                          !isNaN(new Date(result.documentMetadata.updated_at).getTime()) ?
                          new Date(result.documentMetadata.updated_at).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) 
                          : null
                        }
                        </p>
                        <span className="font-regular text-sm text-gray-500">·</span>
                        <p className="font-regular line-clamp-3 text-sm text-gray-500">
                          {result.documentMetadata.type.toUpperCase()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          : <div className="w-[850px]">
             <p>No results found for this query</p>
            </div>
      }
    </div>
  </>
);

// Results Filter Component
const ResultsFilter = ({ results, resultSources }) => (
  <div className="flex w-2/5 flex-col items-end">
    <div className="flex flex-col">
      {
        results ? 
          <AppFilterOptions results={results.searchInformation?.formattedTotalResults} resultSources={resultSources} />
        : <SearchByAppFilterSkeleton />
      }
    </div>
  </div>
);

// Main Component
export default function SearchResults({ search_results, ai_content, isLoadingResults, isLoadingCopilot, resultSources, ai_citations }) {
  return (
    <div className="font-open-sans dark:bg-background flex flex-row dark:text-white items-center justify-start">
      <div style={{flex: 1}} />
      <div style={{flex: 3}} className='bg-background flex flex-col'>
        {isLoadingCopilot ? (
          <SearchCopilotSkeleton />
        ): (
          <AIResults content={ai_content} ai_citations={ai_citations}/>
          )}
        <div className='flex flex-row max-w-full justify-center mt-5'>
          {isLoadingResults ? (
            <SearchResultsSkeleton />
            ) : (
              <Results results={search_results} />
          )}
          <ResultsFilter results={search_results} resultSources={resultSources} />
        </div>
      </div>
      <div style={{flex: 1}} />
    </div>
  );
}
