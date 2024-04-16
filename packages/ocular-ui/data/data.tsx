import { LinkProps } from "@/types/types"

export const accounts = [
  {
    label: "Alicia Koch",
    email: "alicia@example.com",
    icon: (
      <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <title>Vercel</title>
        <path d="M24 22.525H0l12-21.05 12 21.05z" fill="currentColor" />
      </svg>
    ),
  },
  {
    label: "Alicia Koch",
    email: "alicia@gmail.com",
    icon: (
      <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <title>Gmail</title>
        <path
          d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"
          fill="currentColor"
        />
      </svg>
    ),
  },
  {
    label: "Alicia Koch",
    email: "alicia@me.com",
    icon: (
      <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <title>iCloud</title>
        <path
          d="M13.762 4.29a6.51 6.51 0 0 0-5.669 3.332 3.571 3.571 0 0 0-1.558-.36 3.571 3.571 0 0 0-3.516 3A4.918 4.918 0 0 0 0 14.796a4.918 4.918 0 0 0 4.92 4.914 4.93 4.93 0 0 0 .617-.045h14.42c2.305-.272 4.041-2.258 4.043-4.589v-.009a4.594 4.594 0 0 0-3.727-4.508 6.51 6.51 0 0 0-6.511-6.27z"
          fill="currentColor"
        />
      </svg>
    ),
  },
]
  
export type Account = (typeof accounts)[number]

export const links: LinkProps[] =[
  {
    title: "Search",
    label: "",
    icon: "Search",
    variant: "ghost",
    link: "/dashboard/search"
  },
  {
    title: "Marketplace",
    label: "",
    icon: "LayoutGrid",
    variant: "ghost",
    link: "/dashboard/marketplace"
  },
  {
    title: "Chat",
    label: "",
    icon: "Bot", // Changed from "LayoutGrid" to "Chat"
    variant: "ghost",
    link: "/dashboard/chat"
  },
]

export type Link = (typeof links)[number]

export type BottomLinks = (typeof links)[number]

export const apps = [
{
  value: "confluence",
  label: "Confluence",
  icon: "/Confluence.svg",
},
{
  value: "github",
  label: "GitHub",
  icon: "/GitHub.png",
},
{
  value: "jira",
  label: "Jira",
  icon: "/Jira.svg",
},
{
  value: "zendesk",
  label: "Zendesk",
  icon: "/Zendesk.svg",
},
{
  value: "linear",
  label: "Linear",
  icon: "/Linear.png",
},
{
  value: "slack",
  label: "Slack",
  icon: "/Slack.png",
},
]

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