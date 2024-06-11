import { LinkProps } from "@/types/types"

  
export const links: LinkProps[] =[
  {
    title: "Search",
    label: "",
    icon: "Search",
    variant: "ghost",
    link: "/dashboard/search"
  },
  {
    title: "Chat",
    label: "",
    icon: "Bot", // Changed from "LayoutGrid" to "Chat"
    variant: "ghost",
    link: "/dashboard/chat"
  },
  // {
  //   title: "Files",
  //   label: "",
  //   icon: "File",
  //   variant: "ghost",
  //   link: "/dashboard/files"
  // },
  {
    title: "Marketplace",
    label: "",
    icon: "LayoutGrid",
    variant: "ghost",
    link: "/dashboard/marketplace"
  },
]

export type Link = (typeof links)[number]

export type BottomLinks = (typeof links)[number]

export const resultTypes = [
{
  value: "documents",
  label: "Documents",
  icon: "",
},
{
  value: "presentations",
  label: "Presentations",
  icon: "",
},
{
  value: "spreadsheets",
  label: "Spreadsheets",
  icon: "",
},
{
  value: "pdf",
  label: "PDF",
  icon: "",
},
{
  value: "docx",
  label: "DOCX",
  icon: "",
},
{
  value: "csv",
  label: "CSV",
  icon: "",
},
]