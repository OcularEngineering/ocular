import * as React from "react";
import { useState, useContext } from 'react';
import { CheckIcon } from "@radix-ui/react-icons";
import Image from 'next/image';
import {
  ChevronDownIcon,
} from "@heroicons/react/outline";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IconType } from 'react-icons';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";

import { ApplicationContext } from "@/context/context";

interface AppsFacetedFilterProps<TData, TValue> {
  results?: TData; // Define appropriate type if needed
  title?: string;
  Icon: IconType;
  options: {
    label: string
    value: string
    icon: string
  }[]
}

export function AppsFacetedFilter<TData, TValue>({
  results,
  title,
  options,
  Icon,
}: AppsFacetedFilterProps<TData, TValue>) {
  const [selectedValues, setSelectedValues] = useState<Set<string>>(new Set()); // Track selected values with a Set

  const { setselectedResultSources } = useContext(ApplicationContext);

  const handleSelect = (value: string) => {
    const newSelectedValues = new Set(selectedValues);
    if (newSelectedValues.has(value)) {
      newSelectedValues.delete(value);
    } else {
      newSelectedValues.add(value);
    }
    setSelectedValues(newSelectedValues); // Update state
    const newSelectedArray = Array.from(newSelectedValues);
    setselectedResultSources(newSelectedArray); // Update the result sources whenever selection changes
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "dark:bg-muted mb-5 box-border flex h-10 min-w-10 cursor-pointer items-center justify-center gap-2 rounded-full bg-gray-100 px-5"
          )}
          onClick={() => {/* Handle button click if necessary */}}
        >
          <Icon className="h-5 w-5" />
          {title}
          {selectedValues.size > 0 && (
            <>
              <Separator orientation="vertical" className="mx-2 h-4" />
              <Badge
                variant="secondary"
                className="rounded-sm px-1 font-normal lg:hidden"
              >
                {selectedValues.size}
              </Badge>
              <div className="hidden space-x-1 lg:flex">
                {selectedValues.size > 2 ? (
                  <Badge
                    variant="secondary"
                    className="rounded-sm px-1 font-normal"
                  >
                    {selectedValues.size} selected
                  </Badge>
                ) : (
                  options
                    .filter((option) => selectedValues.has(option.value))
                    .map((option) => (
                      <Badge
                        variant="secondary"
                        key={option.value}
                        className="rounded-sm px-1 gap-1 font-normal"
                      >
                        <Image alt="icon" src={option.icon} width={20} height={20} className="ml-2 mr-3"/> {option.label}
                      </Badge>
                    ))
                )}
              </div>
            </>
          )}
          <ChevronDownIcon className={`h-4 ${selectedValues.size ? 'rotate-180' : ''}`} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0 rounded-2xl" align="start">
        <Command className="rounded-2xl">
          <CommandInput placeholder={`Search ${title}`} />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = selectedValues.has(option.value);
                return (
                  <CommandItem
                    key={option.value}
                    onSelect={() => handleSelect(option.value)}
                  >
                    <div
                      className={cn(
                        "border-primary mr-2 flex h-4 w-4 items-center justify-center rounded-sm border",
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "opacity-50 [&_svg]:invisible"
                      )}
                    >
                      <CheckIcon className={cn("h-4 w-4")} />
                    </div>
                    {option && (
                      <Image alt="icon" src={option.icon} width={20} height={20} className="ml-2 mr-3"/>
                      
                    )}
                    <span>{option.label}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
            {selectedValues.size > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={() => {
                      setSelectedValues(new Set());
                      setselectedResultSources([]); // Clear the selection array as well
                    }}
                    className="justify-center text-center"
                  >
                    Clear filters
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
