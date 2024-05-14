"use client"

import { useRouter } from "next/navigation";
import React, { useState, useEffect, useContext } from 'react';

// Importing API End Points
import api from "@/services/api"
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

import { ApplicationContext } from "@/context/context"

export function UserNav()  {
  const router = useRouter()
  const { userProfile, setuserProfile } = useContext(ApplicationContext)

  async function fetchUserData() {
    try {
      const user = await (await api.auth.loggedInUserDetails()).data.user

      if (user) {
        setuserProfile(
          {
            id: user.id,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
            created_at: user.created_at,
            updated_at: user.updated_at,
            organisation_id: user.organisation_id
          }
        )
      }
      else {
        setuserProfile(null)
      }
    } catch (error) {
      console.error("An error occurred while fetching user data:", error);
      // Handle the error as needed, e.g., set an error state, show a notification, etc.
    }
  }

  useEffect(() => {
    fetchUserData()
  }, [])

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
                {userProfile?.first_name[0]}{userProfile?.last_name[0]}
              </AvatarFallback>
            </Avatar>
        </Button>
      </DropdownMenuTrigger>
    <DropdownMenuContent className="mb-5 ml-3 w-56 items-center rounded-xl" side="right">
      <DropdownMenuLabel className="font-normal">
        <div className="flex flex-col space-y-1">
          <p className="text-sm font-medium leading-none">{userProfile?.first_name} {userProfile?.last_name}</p>
          <p className="text-xs leading-none text-muted-foreground">
            {userProfile?.email}
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
