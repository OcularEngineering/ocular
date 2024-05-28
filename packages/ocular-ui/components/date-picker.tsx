import * as React from "react";
import { useState, useContext } from 'react';
import { CalendarIcon } from "@radix-ui/react-icons";
import { format as formatDateFns } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { ApplicationContext } from "@/context/context";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  ChevronDownIcon,
} from "@heroicons/react/outline";

export function DatePickerWithRange({
  className,
}: React.HTMLAttributes<HTMLDivElement>) {

  const { resultFilterDate, setResultFilterDate } = useContext(ApplicationContext);
  const [isSelected, setIsSelected] = useState(false);

  const handleSelect = (date) => {
    if (date?.from !== resultFilterDate?.from || date?.to !== resultFilterDate?.to) {
      setResultFilterDate(date);
    }
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "dark:bg-muted mb-5 box-border flex h-10 min-w-10 cursor-pointer items-center justify-center gap-2 rounded-full bg-gray-100 px-5",
              !resultFilterDate && "text-muted-foreground"
            )}
            onClick={() => setIsSelected(!isSelected)}
          >
            <CalendarIcon className="h-5 w-5" />
            {resultFilterDate?.from ? (
              resultFilterDate.to ? (
                <>
                  {formatDateFns(resultFilterDate.from, "LLL dd, y")} -{" "}
                  {formatDateFns(resultFilterDate.to, "LLL dd, y")}
                </>
              ) : (
                formatDateFns(resultFilterDate.from, "LLL dd, y")
              )
            ) : (
              <span>Anytime</span>
            )}
            <ChevronDownIcon className={`h-4 ${isSelected ? 'rotate-180' : ''}`} />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 rounded-2xl" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={resultFilterDate?.from}
            selected={resultFilterDate}
            onSelect={handleSelect}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
