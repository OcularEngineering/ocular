import { DatePickerWithRange } from "@/components/date-picker";
import { ResultsFacetedFilter } from "./results-faceted-filter";
import { apps, resultTypes } from "@/data/data"

import {
  CollectionIcon
} from "@heroicons/react/outline";
import { LayoutGrid } from 'lucide-react';

export default function HeaderFilterToolbar() {
  return (
     <div className="flex flex-row gap-3">
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
  );
}
