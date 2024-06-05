"use client"

import Link from "next/link"
import Image from "next/image";
import { useTheme } from 'next-themes';
import { useRouter } from 'next/router';
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { UserNav } from "./user-nav"
import { ThemeToggle } from "@/components/theme-toggle"
import { NavProps } from "@/types/types"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider
} from "@/components/ui/tooltip"
import {
  Search,
  Bot,
  Settings,
  HelpCircle,
  LayoutGrid,
  BarChart2,
  Users, 
  Files,
} from "lucide-react"
const iconMapping = {
  Search: Search,
  Bot: Bot,
  Settings: Settings,
  HelpCircle: HelpCircle,
  LayoutGrid,
  BarChart2,
  Users, 
  Files
};

export function SideNav({ links }: NavProps)  {
  const { theme } = useTheme();
  const router = useRouter();

  const isActive = (href: string) => router.pathname === href;

  return (
    <> 
      <ul className="flex flex-col space-y-3">
        <TooltipProvider delayDuration={0}>
          <a className="block" href="/dashboard/search">
              <Image 
                src={require(theme === 'dark' ? "./Ocular-logo-dark.svg" : "./Ocular-logo-light.svg").default} 
                alt="Ocular AI" 
                width={40} 
                height={40} 
                className="mx-auto cursor-pointer rounded py-2" 
              />
          </a>
          {links.map((link, index) => {
            const IconComponent = iconMapping[link.icon];
            return (
              <Tooltip key={index} delayDuration={0}>
                <div className="flex items-center space-x-3">
                  <TooltipTrigger asChild>
                    <Link
                      href={link.link}
                      className={cn(
                        buttonVariants({ variant: link.variant, size: "icon" }),
                        `h-9 w-9 ${isActive(link.link) ? 'bg-accent rounded-md' : 'bg-transparent'}`,
                        link.variant === "default" && "dark:bg-muted dark:text-muted-foreground dark:hover:bg-muted dark:hover:text-white"
                      )}
                    >
                      {IconComponent && <IconComponent style={{ height: '19px', width: '19px' }} />} 
                      <span className="sr-only">{link.title}</span>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="flex items-center gap-4">
                    {link.title}
                    {link.label && (
                      <span className="text-muted-foreground ml-auto">
                        {link.label}
                      </span>
                    )}
                  </TooltipContent>
                </div>
              </Tooltip>
            );
          })}
        </TooltipProvider>
      </ul>
      <ul className="flex flex-col items-center justify-center space-y-3">
        <ThemeToggle />
        <TooltipProvider delayDuration={0}>
            <div className="bg-border h-px w-full"></div>
            <div >
              <UserNav />
            </div>
          </TooltipProvider>
      </ul>
    </>
  );
}


