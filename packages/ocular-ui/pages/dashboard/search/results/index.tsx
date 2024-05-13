"use client";

import React, { useState, useEffect, useContext, useMemo } from 'react';
import Head from "next/head";
import Header from "@/components/search/header";
import { useRouter } from "next/router";
import SearchResults from "@/components/search/search-results";
import { ChatbotUIContext } from "@/context/context"

// Importing API End Points
import api from "@/services/api"

export default function Search() {
  const [ai_content, setAiResults] = useState(null);
  const [search_results, setSearchResults] = useState(null);
  const [isLoadingResults, setIsLoadingResults] = useState(false);
  const [isLoadingCopilot, setIsLoadingCopilot] = useState(false);
  const router = useRouter();

  const { selectedResultSources, resultFilterDate } = useContext(ChatbotUIContext)
  const { setResultSources } = useContext(ChatbotUIContext)

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
    console.log("Selected Values 3:", selectedResultSources);
    api.search.search(router.query.q, selectedResultSources, selectedDate)
      .then(data => {
        // setAiResults(data.data.message.content);
        // setIsLoadingCopilot(false);
        setSearchResults(data.data.hits); 
        setResultSources(data.data.sources); 
        setIsLoadingResults(false); 
      })
      .catch(error => {
        setIsLoadingResults(false); 
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
      <SearchResults search_results={search_results} ai_content={ai_content} isLoadingResults={isLoadingResults} isLoadingCopilot={isLoadingCopilot} />
    </div>
  );
}