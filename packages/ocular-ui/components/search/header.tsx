import { XIcon, SearchIcon } from "@heroicons/react/solid";
import { useRouter } from "next/router";
import React, { useState, useEffect} from "react";
import HeaderFilterToolbar from "./header-filter-toolbar";

export default function Header() {
  const router = useRouter();
  const [searchInput, setSearchInput] = useState(router.query.q);

  // @ts-ignore
  const search = (e) => {
    e.preventDefault();
    if (!searchInput) return;
    router.push(`/dashboard/search/results?q=${searchInput}`);
  }

    // @ts-ignore
  const handleInputChange = (e) => {
    setSearchInput(e.target.value);
  }

  console.log("123")

  return (
    <header className={`bg-background sticky flex flex-col justify-center items-center top-0 dark:text-white shadow-sm dark:border-b`}>
      <div className="w-full max-w-7xl mx-auto px-6 pt-5">
        <div className="flex flex-col items-start space-y-5">
          <form className="bg-background flex w-full grow items-center rounded-full py-3 px-6 border">
            <input
              type="text"
              value={searchInput}
              onChange={handleInputChange}
              placeholder="Search for anything here"
              className="bg-background w-full grow focus:outline-none"
            />

            {searchInput && (
              <XIcon
                className="h-6 cursor-pointer text-gray-500 transition duration-100 hover:scale-110"
                onClick={() => setSearchInput("")}
              />
            )}

            <button type="submit" onClick={search}>
              <SearchIcon className="h-6 cursor-pointer pl-2 text-blue-500" />
            </button>
          </form>
          <HeaderFilterToolbar />
        </div>
      </div>
    </header>
  );
}