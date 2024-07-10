"use client";

import { useState, useContext } from 'react';
import Image from 'next/image';

import { ApplicationContext } from "@/context/context";

type AppFilterOptionProps = {
  src: string;
  label: string;
  value: string;
  results?: any;
};

export default function AppFilterOption({ src, label, value, results }: AppFilterOptionProps) {
  const { setselectedResultSources, activeFilter, setActiveFilter } = useContext(ApplicationContext);
  
  const handleClick = () => {
    setselectedResultSources([value]);
    setActiveFilter(value);
  };

  const isSelected = activeFilter === value;

  return (
    <div
      className={`hover:dark:bg-muted box-border flex h-10 w-64 min-w-10 cursor-pointer items-center justify-start rounded-full px-5 hover:bg-gray-100 ${
        isSelected ? 'bg-blue-100 dark:bg-muted border-input' : 'bg-blue-100 bg-transparent border-input'
      }`}
      onClick={handleClick}
    >
      <div className='flex grow gap-2'>
        <Image src={src} alt={label} width={20} height={20} />
        <p className="hidden font-semibold text-sm sm:inline-flex dark:text-white">
          {label}
        </p>
      </div>
      {/* <p className="hidden text-sm text-gray-500 sm:inline-flex">
        3
      </p> */}
    </div>
  );
}
