
import { useState } from 'react';
import { Button } from "@/src/components/ui/button"
import { cn } from "@/src/lib/utils"

import {
  ChevronDownIcon,
} from "@heroicons/react/outline";

import { IconType } from 'react-icons';

type HeaderOptionProps = {
  Icon: IconType;
  title: string;
  selected: boolean;
};

export default function HeaderOption({ Icon, title, selected }: HeaderOptionProps)  {
  const [isSelected, setIsSelected] = useState(false);

  return (
    <Button
      id="headerOption"
      variant={"outline"}
      className={cn(
        "dark:bg-secondary-dark mb-5 box-border flex h-10 min-w-10 cursor-pointer items-center justify-center gap-2 rounded-full bg-gray-100 px-5"
      )}
      onClick={() => setIsSelected(!isSelected)}
    >
      <Icon className="h-5 w-5" />
      <span>{title}</span>
      <ChevronDownIcon className={`h-4 ${isSelected ? 'rotate-180' : ''}`} />
    </Button>
  );
}



