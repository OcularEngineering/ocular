import { Metadata } from "next"
import { SidebarNav } from "@/components/marketplace/sidebar-nav"
import { MarketplaceLayoutProps } from "@/types/types"
import SectionContainer from '@/components/section-container';

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
  
]

export default function MarketplaceLayout({ children }: MarketplaceLayoutProps) {
  return (
    <div className="items-start justify-start">
        <SidebarNav items={sidebarNavLinks} />
        <div className="flex items-center justify-center">
            {children}
        </div>
    </div>
  )
}
