"use client"

import { useRouter } from "next/navigation";
import React, { useState, useEffect } from 'react';

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
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function UserNav()  {
  const router = useRouter()

  const [firstName, setFirstName] = React.useState('')
  const [lastName, setLastName] = React.useState('')
  const [email, setEmail] = React.useState('')
  const [role, setRole] = React.useState('')

  async function fetchUserData(){

    try {
      const response = await api.auth.loggedInUserDetails();
      console.log("response:", response)
      if (response) {
        setFirstName(response.data.user.first_name);
        setLastName(response.data.user.last_name);
        setEmail(response.data.user.email);
        setRole(response.data.user.role);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
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

  async function navigateToSettingsPage(event: React.SyntheticEvent) {
    event.preventDefault()

    try {
      router.push(`/dashboard/settings`)
    } catch (error) {
      console.error(error)
    }
  }

  async function navigateToAdminConsole(event: React.SyntheticEvent) {
    event.preventDefault()

    try {
      router.push(`/admin/insights`)
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-9 w-9">
              <AvatarImage src="/michael.png" alt="User" />
              <AvatarFallback>
                {firstName[0]}{lastName[0]}
              </AvatarFallback>
            </Avatar>
        </Button>
      </DropdownMenuTrigger>
    <DropdownMenuContent className="mb-5 ml-3 w-56 items-center" side="right">
      <DropdownMenuLabel className="font-normal">
        <div className="flex flex-col space-y-1">
          <p className="text-sm font-medium leading-none">{firstName} {lastName}</p>
          <p className="text-xs leading-none text-muted-foreground">
            {email}
          </p>
        </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {role === 'admin' && (
            <DropdownMenuItem onClick={navigateToAdminConsole}>
              Admin Console
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={navigateToSettingsPage}>
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem onClick={navigateToSettingsPage}>
            Settings
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuItem>Support</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logOut}>
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
