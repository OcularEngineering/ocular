"use client";

import React, { useState, useEffect, useContext, useMemo } from 'react';
import Head from "next/head";
import Header from "@/components/search/header";
import { useRouter } from "next/router";
import SearchResults from "@/components/search/search-results";
import { ApplicationContext } from "@/context/context"
import { createReader,readStream } from '@/lib/stream';

// Importing API End Points
import api from "@/services/api"

export default function Search() {
  const [ai_content, setAiResults] = useState(null);
  const [ai_citations, setai_citations] = useState(null);
  const [search_results, setSearchResults] = useState(null);
  const [isLoadingResults, setIsLoadingResults] = useState(false);
  const [isLoadingCopilot, setIsLoadingCopilot] = useState(false);
  const router = useRouter();

  const { selectedResultSources, resultFilterDate, setResultSources, resultSources } = useContext(ApplicationContext)

  // Serialize the date to JSON format when logging
const selectedDate = useMemo(() => {
  return resultFilterDate ? {
    "from": resultFilterDate.from?.toISOString(),
    "to": resultFilterDate.to?.toISOString()
  } : {
    "from": null,
    "to": null
  };
}, [resultFilterDate]);

  useEffect(() => {
    setIsLoadingResults(true); 
    setIsLoadingCopilot(true);
    // Search
    api.search.search(router.query.q, selectedResultSources, selectedDate)
      .then(data => { 
        setSearchResults(data.data.hits); 
        setResultSources(data.data.sources); 
        setIsLoadingResults(false); 
      })
      .catch(error => {
        setIsLoadingResults(false);
      });
    // Copilot
    const stream = true;
    api.search.ask(router.query.q, selectedResultSources, selectedDate, stream)
    .then(async response => {
      setIsLoadingCopilot(false);
      if(stream){
        const reader = createReader(response.body);
        const chunks = readStream(reader);
        for await (const chunk of chunks) {
          setAiResults(chunk.chat_completion.content);
          setai_citations(chunk.chat_completion.citations);
        }
      } else {
        setAiResults(response.data.chat_completion.content);
        setai_citations(response.data.chat_completion.citations);
        setIsLoadingCopilot(false);
      }
    })
    .catch(error => {
      console.error(error);
      setIsLoadingCopilot(false);
    });
  }, [router.query.q, selectedResultSources, setResultSources, selectedDate]); 

  return (
    <div className="dark:bg-background w-full bg-white text-black ">
      <Head>
        <title>{router.query.q} - Ocular</title>
        <link rel="icon" href="/Ocular-Profile-Logo.png" />
      </Head>
      <Header />
      <SearchResults search_results={search_results} ai_content={ai_content} ai_citations={ai_citations} isLoadingResults={isLoadingResults} isLoadingCopilot={isLoadingCopilot} resultSources={resultSources} />
    </div>
  );
}