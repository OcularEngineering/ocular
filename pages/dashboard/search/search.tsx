"use client";

import React, { useState, useEffect } from 'react';
import Head from "next/head";
import Header from "@/components/search/header";
import { useRouter } from "next/router";
import SearchResults from "@/components/search/search-results";
import MockResponse from "@/data/MockResponse";

export default function Search() {
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsLoading(true); 
    setTimeout(() => {
      const data = MockResponse;
      setResults(data); 
      setIsLoading(false); 
    }, 1000); 
  }, []); 

  if (isLoading) return <p>Loading...</p>;
  if (!results) return <p>Loading...</p>;

  return (
    <div className="dark:bg-primary-dark bg-white text-black">
      <Head>
        <title>{router.query.term} - Ocular</title>
        <link rel="icon" href="/Ocular-Profile-Logo.png" />
      </Head>
      
      <Header />
      <SearchResults results={results} />
    </div>
  );
}
