"use client";

import { useState } from 'react';
import AppFilterOption from "./app-filter-option";
import Image from 'next/image';

const iconsArray = ['asana.svg', 'google-drive.svg'];

type AppFilterOptionsProps = {
    results: any; 
};

export default function AppFilterOptions({results}: AppFilterOptionsProps) {
    const [isSelected, setIsSelected] = useState(false);
    return (
        <div className="mt-3 flex w-full text-sm text-gray-700 lg:justify-start lg:text-base dark:text-gray-400">
            <div className="flex w-full flex-col justify-start space-y-2 sm:w-auto">
                {/* <AppFilterOption src="/All.svg"  title="All apps" key="All" results={"3k"}/> */}
                <div
                    className={`hover:dark:bg-muted box-border flex h-10 w-64 min-w-10 cursor-pointer items-center justify-start rounded-full px-5 hover:bg-gray-100 ${isSelected ? 'bg-blue-100 dark:bg-muted border border-input' : 'bg-blue-100 dark:bg-muted border border-input'}`}
                    onClick={() => setIsSelected(!isSelected)}
                    >
                    <div className='flex grow gap-2'>
                        <Image src="/All.svg" alt={"All"} width={20} height={20} />
                        <p className="hidden text-sm sm:inline-flex dark:text-white">All</p>
                    </div>
                    <p className="hidden text-sm text-gray-500 sm:inline-flex">3k</p>
                </div>
                {iconsArray.map((iconName) => (
                    <AppFilterOption src={`/${iconName}`}  title={iconName} key={iconName} />
                ))}
            </div>
        </div>
    );
}