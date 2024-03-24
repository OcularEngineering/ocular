"use client";

import { useState } from 'react';
import Image from 'next/image';

type AppFilterOptionProps = {
  src: string;
  title: string;
  results?: any;
};

export default function AppFilterOption({ src, title, results }: AppFilterOptionProps) {
  const [isSelected, setIsSelected] = useState(false);

  return (
    <div
      className={`hover:dark:bg-secondary-dark box-border flex h-10 w-64 min-w-10 cursor-pointer items-center justify-start rounded-full px-5 hover:bg-gray-100 ${isSelected ? 'bg-blue-100' : ''}`}
      onClick={() => setIsSelected(!isSelected)}
    >
      <div className='flex grow gap-2'>
        <Image src={src} alt={title} width={20} height={20} />
        <p className="hidden text-sm sm:inline-flex dark:text-white">{(title.split('.')[0].charAt(0).toUpperCase() + title.split('.')[0].slice(1))}</p>
      </div>
      <p className="hidden text-sm text-gray-500 sm:inline-flex">{results ? results : Math.floor(Math.random() * 1000) + 1}</p>
    </div>
  );
}