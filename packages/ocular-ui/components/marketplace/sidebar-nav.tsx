"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { SidebarNavProps } from "@/types/types"

export function SidebarNav({ className, items, ...props }: SidebarNavProps) {
  const pathname = usePathname()

  return (
    <nav
      className={cn(
        "flex flex-col lg:space-y-2 mt-20 mx-5",
        className
      )}
      {...props}
    >
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            buttonVariants({ variant: "ghost" }),
            pathname === item.href
              ? "bg-muted hover:bg-muted"
              : "hover:bg-gray-100 dark:hover:bg-muted",
            "justify-start hover:dark:bg-muted box-border flex h-10 cursor-pointer justify-start rounded-full px-5 hover:bg-gray-100"
          )}
        >
          {item.title}
        </Link>
      ))}
    </nav>
  )
}
