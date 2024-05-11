import * as React from "react"
import { useState, useContext } from 'react';
import { CalendarIcon } from "@radix-ui/react-icons"
import { addDays, format as formatDateFns } from "date-fns"
import { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { ChatbotUIContext } from "@/context/context";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

import {
  ChevronDownIcon,
} from "@heroicons/react/outline";

export function DatePickerWithRange({
  className,
}: React.HTMLAttributes<HTMLDivElement>) {

  const { resultFilterDate, setResultFilterDate } = useContext(ChatbotUIContext);

  // const [date, setDate] = React.useState<DateRange | undefined>({
  //   from: new Date(2024, 3, 20),
  //   to: addDays(new Date(2024, 3, 20), 20),
  // })
  const [isSelected, setIsSelected] = useState(false);

  // Serialize the date to JSON format when logging
  const logDate = resultFilterDate ? {
    "date": {
      "from": resultFilterDate.from?.toISOString(),
      "to": resultFilterDate.to?.toISOString()
    }
  } : {
    "date": {
      "from": null,
      "to": null
    }
  };

  console.log("Date Selected JSON 1:", logDate.date);

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
              <span>Pick a date</span>
            )}
            <ChevronDownIcon className={`h-4 ${isSelected ? 'rotate-180' : ''}`} />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={resultFilterDate?.from}
            selected={resultFilterDate}
            onSelect={setResultFilterDate}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
