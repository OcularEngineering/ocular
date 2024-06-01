import { Metadata } from "next"
import { SidebarNav } from "@/components/marketplace/sidebar-nav"
import { MarketplaceLayoutProps } from "@/types/types"

export const metadata: Metadata = {
  title: "Marketplace",
  description: "Marketplace for Ocular AI",
}

const sidebarNavLinks = [
  {
    title: "Browse apps",
    href: "/dashboard/marketplace/browse-apps",
  },
  {
    title: "Manage apps",
    href: "/dashboard/marketplace/manage-apps",
  },
  {
    title: "OAuth credentials",
    href: "/dashboard/marketplace/oauth-credentials",
  },

]

export default function MarketplaceLayout({ children }: MarketplaceLayoutProps) {
  return (
    <div className="flex flex-row items-start justify-start">
        <div className="border-r h-screen sticky w-[250px] top-0">
            <SidebarNav items={sidebarNavLinks} />
        </div>
        <div style={{ flex: 20 }} className="flex items-center justify-center">
            {children}
        </div>
    </div>
  )
}