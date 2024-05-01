"use client";

import React, { useState, useEffect } from 'react';
import Head from "next/head";
import Header from "@/components/search/header";
import { useRouter } from "next/router";
import SearchResults from "@/components/search/search-results";

// Importing API End Points
import api from "@/services/api"
import { set } from 'nprogress';

export default function Search() {
  const [ai_content, setAiResults] = useState(null);
  const [search_results, setSearchResults] = useState(null);
  const [isLoadingResults, setIsLoadingResults] = useState(false);
  const [isLoadingCopilot, setIsLoadingCopilot] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsLoadingResults(true); 
    setIsLoadingCopilot(true);
    api.search.search(router.query.q)
      .then(data => {
        setAiResults(data.data.message.content);
        setIsLoadingCopilot(false);
        setSearchResults(data.data.hits); 
        setIsLoadingResults(false); 
      })
      .catch(error => {
        setIsLoadingResults(false); 
        setIsLoadingCopilot(false);

      });
  }, [router.query.q]); 

  return (
    <div className="dark:bg-background w-full bg-white text-black">
      <Head>
        <title>{router.query.q} - Ocular</title>
        <link rel="icon" href="/Ocular-Profile-Logo.png" />
      </Head>
      <Header />
      <SearchResults search_results={search_results} ai_content={ai_content} isLoadingResults={isLoadingResults} isLoadingCopilot={isLoadingCopilot} />
    </div>
  );
}