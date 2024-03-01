"use client";

import React, { useState, useEffect } from 'react';
import Head from "next/head";
import Header from "@/components/search/header";
import { useRouter } from "next/router";
import SearchResults from "@/components/search/search-results";
import Image from 'next/image'

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

  if (isLoading) return (      
    <div className="flex items-center justify-center min-h-screen min-w-full">
      <Image 
          src={"/AI.svg"} 
          alt="Loading..." 
          width={600} 
          height={600} 
          className="animate-pulse duration-5000"
      />
    </div>
  );
  if (!results) return (      
    <div className="flex items-center justify-center min-h-screen min-w-full">
      <Image 
          src={"/AI.svg"} 
          alt="Loading..." 
          width={600} 
          height={600} 
          className="animate-pulse duration-5000"
      />
    </div>
  );

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