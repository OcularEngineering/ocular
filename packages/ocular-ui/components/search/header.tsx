import { XIcon, SearchIcon } from "@heroicons/react/solid";
import { useRouter } from "next/router";
import React, { useState, useEffect} from "react";
import HeaderFilterToolbar from "./header-filter-toolbar";

export default function Header() {
  const router = useRouter();
  const [searchInput, setSearchInput] = useState(router.query.q);
  const [showHeaderFilterToolbar, setShowHeaderFilterToolbar] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      setShowHeaderFilterToolbar(window.scrollY === 0);
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []); 

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

  return (
    <header className={`bg-background sticky top-0 font-sans dark:text-white shadow-sm dark:border-b z-1000`}>
      <div className="flex w-full items-center justify-between p-6">
        <div className="flex w-full flex-col items-center sm:flex-row ">
          <form className={`bg-background mt-5 flex w-full max-w-3xl grow items-center rounded-full px-6 py-3 sm:ml-10 sm:mr-5 sm:mt-0 ${
            showHeaderFilterToolbar ? 'border lg:max-w-5xl' : 'border lg:max-w-5xl'
          } `}>
          
            <input
              type="text"
              value={searchInput}
              onChange={handleInputChange}
              placeholder="Search for anything here"
              className="bg-background w-full grow focus:outline-none"
            />

            {searchInput && (
              <XIcon
                className="h-6 cursor-pointer text-gray-500 transition duration-100 hover:scale-110 sm:mr-3"
                onClick={() => setSearchInput("")}
              />
            )}

            <button type="submit" onClick={search}>
              <SearchIcon className="h-6 cursor-pointer pl-2 text-blue-500" />
            </button>
          </form>
        </div>
      </div>
      <div>
      {showHeaderFilterToolbar && <HeaderFilterToolbar />}
      </div>
    </header>
  );
}