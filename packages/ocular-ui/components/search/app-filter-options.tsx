"use client";

import { useContext } from 'react';
import AppFilterOption from "./app-filter-option";
import Image from 'next/image';
import { ApplicationContext } from "@/context/context";
import { formatLabel } from '@/lib/utils';
import { LayoutGrid } from 'lucide-react';

type AppFilterOptionsProps = {
    results: any; 
    resultSources: string[];
};

export default function AppFilterOptions({results, resultSources}: AppFilterOptionsProps) {
    const { activeFilter, setActiveFilter, setselectedResultSources } = useContext(ApplicationContext);

    const handleClick = () => {
        setselectedResultSources(resultSources);
        setActiveFilter('All');
    };

    const isSelected = activeFilter === 'All';

    const mappedResultSources = resultSources.map(source => ({
        label: formatLabel(source),
        value: source,
        icon: `/${source}.svg`,
      }));

    return (
        <div className="mt-3 flex w-full text-sm text-gray-700 lg:justify-start lg:text-base dark:text-gray-400">
            <div className="flex w-full flex-col justify-start space-y-2 sm:w-auto">
                <div
                    className={`hover:dark:bg-muted box-border flex h-10 w-64 min-w-10 cursor-pointer items-center justify-start rounded-full px-5 hover:bg-gray-100 ${isSelected ? 'bg-blue-100 dark:bg-muted border border-input' : 'border-input'}`}
                    onClick={handleClick}
                >
                    <div className='flex grow gap-2'>
                        <LayoutGrid size={20} className='dark:text-white'/>
                        <p className="hidden font-semibold text-sm sm:inline-flex dark:text-white">All</p>
                    </div>
                    {/* <p className="hidden text-sm text-gray-500 sm:inline-flex">3</p> */}
                </div>
                {mappedResultSources.map((iconName) => (
                    <AppFilterOption src={iconName.icon} label={iconName.label} key={iconName.value} value={iconName.value} />
                ))}
            </div>
        </div>
    );
}