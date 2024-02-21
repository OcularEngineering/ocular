import { Metadata } from "next"

import { SidebarNav } from "@/components/settings/sidebar-nav"
import { SettingsLayoutProps } from "@/types/types"

export const metadata: Metadata = {
  title: "Forms",
  description: "Advanced form example using react-hook-form and Zod.",
}

const sidebarNavItems = [
  {
    title: "Profile",
    href: "/dashboard/settings",
  },
  {
    title: "Notifications",
    href: "/dashboard/settings/notifications",
  },
  {
    title: "Security",
    href: "/dashboard/settings/security",
  },
]

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  return (
    <div className="my-10 w-full  space-y-[40px]">
      <div className="flex flex-col items-start justify-between space-y-[10px]">
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">
          Manage your profile, appearance, notifications, security, and billing details.
        </p>
      </div>
      <div className="flex w-full flex-col space-y-10">
        <aside className="w-full">
          <SidebarNav items={sidebarNavItems} />
        </aside>
        <div className="w-full max-w-xl flex-1">{children}</div>
      </div>
    </div>
  )
}
