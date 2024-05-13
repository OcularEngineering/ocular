"use client";

import { useContext } from 'react';
import { ApplicationContext } from "@/context/context";
import { DatePickerWithRange } from "@/components/date-picker";
import { AppsFacetedFilter } from "./apps-faceted-filter";
import { formatLabel } from '@/lib/utils';

import {
  CollectionIcon
} from "@heroicons/react/outline";
import { LayoutGrid } from 'lucide-react';

export default function HeaderFilterToolbar() {
  const { resultSources } = useContext(ApplicationContext);

  const mappedResultSources = resultSources.map(source => ({
    label: formatLabel(source),
    value: source,
    icon: `/${source}.svg`,
  }));

  return (
     <div className="flex flex-row gap-3">
      <DatePickerWithRange />
      <AppsFacetedFilter
        // results=""
        title="Apps"
        options={mappedResultSources}
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
