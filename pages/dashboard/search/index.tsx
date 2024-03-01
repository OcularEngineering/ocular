"use client";

import Head from "next/head";
import Image from "next/image";
import {
  SearchIcon,
} from "@heroicons/react/solid";

import { useRef } from "react";
import { useRouter } from "next/router";

export function Search() {
  const router = useRouter();
  const searchInputRef = useRef<HTMLInputElement>(null);

  function search(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (searchInputRef.current) {
      const q = searchInputRef.current.value;
      if (!q) return;

      router.push(`/dashboard/search/results?q=${q}`);
    }
  }
  return (
    <>
      <div className="dark:bg-primary-dark group flex min-h-screen flex-col items-center justify-between dark:text-white">

        <Head>
            <meta charSet="utf-8" />
            <meta
              name="viewport"
              content="width=device-width, initial-scale=1.0"
            />
            <meta name="description" content="description of your project" />
            <meta name="theme-color" content="#000" />
            <title>Ocular AI</title>
            <link rel="manifest" href="/manifest.json" />
            <link rel="shortcut icon" href="/Ocular-Profile-Logo.png" />
            <link rel="apple-touch-icon" href="/Ocular-Profile-Logo.png"></link>
          </Head>
          {/* Body */}
          <form className="flex h-96 w-[80%] grow space-y-10 flex-col items-center justify-center sm:w-[90%]">
            <Image
                src="/Ocular-full-light.svg"
                className="w-225 md:w-300 md:h-100"
                width={300}
                height={75}
                alt=""
              />

            <div className="dark:bg-gray-700md:dark:hover:border-gray-100 mt-5 flex w-full max-w-md  items-center rounded-full border px-5 py-2 focus-within:shadow hover:shadow sm:max-w-xl sm:py-3 md:hover:border-white lg:max-w-4xl">
                <SearchIcon className="mr-3 h-5 text-gray-500 " />
                <input
                  ref={searchInputRef}
                  type="text"
                  className="dark:bg-transparent custom-input w-full grow focus:outline-none"
                  placeholder="Search for anything here"
                />
            </div>
            <div className="mt-8 flex w-[90%] flex-row justify-center space-x-3 space-y-0 sm:space-x-4">
              <button type="submit" onClick={search} className="btn" style={{display: 'none'}}>
                Submit Querry Button
              </button>
            </div>
          </form>
      </div>
      <div id="portal"></div>
    </>
  );
}

export default Search;