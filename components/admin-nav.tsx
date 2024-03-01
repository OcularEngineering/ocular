"use client"

// Importing API End Points
import api from "@/services/api"

import { useRouter } from 'next/router';
import { cn } from "@/lib/utils"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useTheme } from 'next-themes';
import Image from "next/image";
import { Separator } from "@/components/ui/separator"
import { ExternalLink } from 'lucide-react';

interface AdminNavProps extends React.HTMLAttributes<HTMLDivElement> {
}

export function AdminNav({ className }: AdminNavProps) {
  const { theme } = useTheme();
  const router = useRouter();

  const isActive = (href: string) => router.pathname === href;

  async function logOut(event: React.SyntheticEvent) {
    event.preventDefault()

    try {
      await api.auth.deauthenticate()
      router.push(`/sign-in`)
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <>
      <div className={cn("pb-12 flex flex-col", className)}>
        <div className="px-3 justify-start">
          <a className="block" href="/admin/insights">
            <Image 
              src={require(theme === 'dark' ? "./Ocular-full-dark.svg" : "./Ocular-full-light.svg").default} 
              alt="AutoFlowAI" 
              width={150} 
              height={150} 
              className="cursor-pointer rounded py-2" 
            />
          </a>
        </div>
        <div className="space-y-4 py-4">
          <div className="px-3 py-2 space-y-4">
            <h3 className="mb-2 px-4 text-lg font-semibold tracking-tight">
              Admin Console
            </h3>
            <div className="space-y-2">
              <div>
                <Link href="/admin/insights">
                  <Button 
                    variant="secondary" 
                    className={`
                      w-full justify-start text-md font-normal dark:bg-transparent
                      ${isActive("/admin/insights") ? "font-bold" : "hover:bg-white hover:dark:bg-transparent"}
                    `}
                  >
                    Insights
                  </Button>
                </Link>
              </div>
              <div>
                <Link href="/admin/members">
                  <Button 
                    variant="secondary" 
                    className={`
                      w-full justify-start text-md font-normal 
                      ${isActive("/admin/members") ? "font-bold" : "hover:bg-white dark:bg-transparent"}
                    `}
                  >
                    Members
                  </Button>
                </Link>
              </div>
              <div>
                <Link href="/admin/teams">
                  <Button 
                    variant="secondary" 
                    className={`
                      w-full justify-start text-md font-normal 
                      ${isActive("/admin/teams") ? "font-bold" : "hover:bg-white dark:bg-transparent"}
                    `}
                  >
                    Teams
                  </Button>
                </Link>
              </div>
              <div>
                <Link href="/admin/marketplace">
                  <Button 
                    variant="secondary" 
                    className={`
                      w-full justify-start text-md font-normal 
                      ${isActive("/admin/marketplace") ? "font-bold" : "hover:bg-white dark:bg-transparent"}
                    `}
                  >
                     Marketplace
                  </Button>
                </Link>
              </div>
              {/* <div>
                <Link href="/admin/components">
                  <Button 
                    variant="secondary" 
                    className={`
                      w-full justify-start text-md font-normal 
                      ${isActive("/admin/components") ? "font-bold" : "hover:bg-white dark:bg-transparent"}
                    `}
                  >
                    Components
                  </Button>
                </Link>
              </div> */}
              <div>
                <Link href="/admin/billing">
                  <Button 
                    variant="secondary" 
                    className={`
                      w-full justify-start text-md font-normal 
                      ${isActive("/admin/billing") ? "font-bold" : "hover:bg-white dark:bg-transparent"}
                    `}
                  >
                    Billing
                  </Button>
                </Link>
              </div>
              <div>
                <Link href="/admin/security">
                  <Button 
                    variant="secondary" 
                    className={`
                      w-full justify-start text-md font-normal 
                      ${isActive("/admin/security") ? "font-bold" : "hover:bg-white dark:bg-transparent"}
                    `}
                  >
                    Security
                  </Button>
                </Link>
              </div>
              <div>
                <Link href="/admin/settings">
                  <Button 
                    variant="secondary" 
                    className={`
                      w-full justify-start text-md font-normal 
                       ${isActive("/admin/settings") ? "font-bold" : "hover:bg-white dark:bg-transparent"}
                    `}
                  >
                    Settings
                  </Button>
                </Link>
              </div>
              <Separator className="justify-center px-[30px]"/>
              <div>
                <Link href="/dashboard/search" passHref legacyBehavior>
                  <a target="_blank" rel="noopener noreferrer">
                    <Button 
                      variant="secondary" 
                      className="w-full justify-start text-sm font-normal dark:bg-transparent"
                    >
                      Launch Ocular
                      <ExternalLink size={16} className="ml-2"/>
                    </Button>
                  </a>
                </Link>
              </div>
            </div> 
          </div>
          
        </div>
      </div>    
      <div className={cn("pb-5 pl-3 pr-[90px] flex flex-col justify-start", className)}>
        <Button variant="outline" className="w-full justify-center hover:bg-gray-200 dark:bg-transparent text-md font-normal border bg-white" onClick={logOut}>
          Sign out
        </Button>
      </div>
    </>
  )
}
