import HeaderOption from "./header-option";
import { DatePickerWithRange } from "@/src/components/date-picker";
import { ResultsFacetedFilter } from "./results-faceted-filter";
import { apps, resultTypes } from "@/src/data/data"

import {
  CollectionIcon
} from "@heroicons/react/outline";
import { LayoutGrid } from 'lucide-react';

export default function HeaderFilterToolbar() {
  return (
    <div className="flex w-full justify-evenly text-sm text-gray-700 lg:justify-start lg:space-x-36 lg:pl-52 lg:text-base dark:text-gray-400">
      <div className="flex w-full justify-evenly space-x-6 sm:w-auto sm:justify-start  ">
        <DatePickerWithRange />
        <ResultsFacetedFilter
          // results=""
          title="Apps"
          options={apps}
          Icon={LayoutGrid}
        />
        <ResultsFacetedFilter
          // results=""
          title="Type"
          options={resultTypes}
          Icon={CollectionIcon}
        />
      </div>
    </div>
  );
}
