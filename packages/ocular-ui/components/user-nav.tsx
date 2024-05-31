"use client"

import { useRouter } from "next/navigation";
import React, { useContext } from 'react';
import { ApplicationContext } from "@/context/context"
import { Button } from "@/components/ui/button"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Importing API End Points
import api from "@/services/api"

export function UserNav()  {
  const router = useRouter()
  const { profile } = useContext(ApplicationContext);

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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-9 w-9">
              <AvatarImage src="" alt="User" />
              <AvatarFallback>
                {profile?.first_name[0]}{profile?.last_name[0]}
              </AvatarFallback>
            </Avatar>
        </Button>
      </DropdownMenuTrigger>
    <DropdownMenuContent className="mb-5 ml-3 w-56 items-center rounded-xl" side="right">
      <DropdownMenuLabel className="font-normal">
        <div className="flex flex-col space-y-1">
          <p className="text-sm font-medium leading-none">{profile?.first_name} {profile?.last_name}</p>
          <p className="text-xs leading-none text-muted-foreground">
            {profile?.email}
          </p>
        </div>
        </DropdownMenuLabel>
        <DropdownMenuItem onClick={logOut}>
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
