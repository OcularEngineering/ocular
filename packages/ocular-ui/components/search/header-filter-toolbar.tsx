"use client";

import { useContext } from 'react';
import { ChatbotUIContext } from "@/context/context";
import { DatePickerWithRange } from "@/components/date-picker";
import { AppsFacetedFilter } from "./apps-faceted-filter";
import { apps, resultTypes } from "@/data/data"

import {
  CollectionIcon
} from "@heroicons/react/outline";
import { LayoutGrid } from 'lucide-react';

export default function HeaderFilterToolbar() {
  const { resultSources } = useContext(ChatbotUIContext);

  return (
     <div className="flex flex-row gap-3">
      <DatePickerWithRange />
      <AppsFacetedFilter
        // results=""
        title="Apps"
        options={resultSources}
        Icon={LayoutGrid}
      />
      {/* <AppsFacetedFilter
        // results=""
        title="Type"
        options={resultTypes}
        Icon={CollectionIcon}
      /> */}
    </div>
  );
}
