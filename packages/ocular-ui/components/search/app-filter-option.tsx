"use client";

import { useState, useContext } from 'react';
import Image from 'next/image';

import { ChatbotUIContext } from "@/context/context";

type AppFilterOptionProps = {
  src: string;
  title: string;
  results?: any;
};

export default function AppFilterOption({ src, title, results }: AppFilterOptionProps) {
  const [isSelected, setIsSelected] = useState(false);

  // Access the context and ensure it's valid
  const { setResultSources, resultSources } = useContext(ChatbotUIContext);

  const handleClick = () => {
    setIsSelected(!isSelected);

    // Set `resultSources` to an array containing only the current title
    setResultSources(["google-drive"]);

    console.log("Source selected 2:", resultSources);
  };

  return (
    <div
      className={`hover:dark:bg-muted box-border flex h-10 w-64 min-w-10 cursor-pointer items-center justify-start rounded-full px-5 hover:bg-gray-100 ${
        isSelected ? 'bg-blue-100 dark:bg-muted border-input' : 'bg-transparent border-input'
      }`}
      onClick={handleClick}
    >
      <div className='flex grow gap-2'>
        <Image src={src} alt={title} width={20} height={20} />
        <p className="hidden text-sm sm:inline-flex dark:text-white">
          {title.split('.')[0].charAt(0).toUpperCase() + title.split('.')[0].slice(1)}
        </p>
      </div>
      <p className="hidden text-sm text-gray-500 sm:inline-flex">
        {results ? results : Math.floor(Math.random() * 1000) + 1}
      </p>
    </div>
  );
}
