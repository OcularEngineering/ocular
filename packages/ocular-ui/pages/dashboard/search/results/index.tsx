"use client";

import React, { useState, useEffect, useContext } from 'react';
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

  const { selectedResultSources } = useContext(ChatbotUIContext)
  const { setResultSources } = useContext(ChatbotUIContext)

  useEffect(() => {
    setIsLoadingResults(true); 
    setIsLoadingCopilot(true);
    api.search.search(router.query.q, selectedResultSources)
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
  }, [router.query.q, selectedResultSources, setResultSources]); 

  return (
    <div className="dark:bg-background w-full bg-white text-black items-center justify-center">
      <Head>
        <title>{router.query.q} - Ocular</title>
        <link rel="icon" href="/Ocular-Profile-Logo.png" />
      </Head>
      <Header />
      <SearchResults search_results={search_results} ai_content={ai_content} isLoadingResults={isLoadingResults} isLoadingCopilot={isLoadingCopilot} />
    </div>
  );
}