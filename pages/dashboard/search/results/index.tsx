"use client";

import React, { useState, useEffect } from 'react';
import Head from "next/head";
import Header from "@/components/search/header";
import { useRouter } from "next/router";
import SearchResults from "@/components/search/search-results";

// Importing API End Points
import api from "@/services/api"

export default function Search() {
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsLoading(true); 
    api.search.query(router.query.q)
      .then(data => {
        setResults(data.data); 
        setIsLoading(false); 
      })
      .catch(error => {
        console.error(error);
        setIsLoading(false); 
      });
  }, [router.query.q]); 

  if (isLoading) return <p>Loading...</p>;
  if (!results) return <p>Loading...</p>;

  return (
    <div className="dark:bg-primary-dark w-full bg-white text-black">
      <Head>
        <title>{router.query.q} - Ocular</title>
        <link rel="icon" href="/Ocular-Profile-Logo.png" />
      </Head>
      
      <Header />
      <SearchResults results={results} />
    </div>
  );
}