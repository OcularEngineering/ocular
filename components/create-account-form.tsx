"use client"

import * as React from "react"
import { useRouter } from "next/navigation";

// Importing API End Points
import api from "@/services/admin-api"

// Importing Components
import { cn } from "@/lib/utils"
import { Icons } from "@/components/ui/icons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface CreateAccountFormProps extends React.HTMLAttributes<HTMLDivElement> {}

export function CreateAccountForm({ className, ...props }: CreateAccountFormProps) {
  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const [firstName, setFirstName] = React.useState('')
  const [lastName, setLastName] = React.useState('')
  const [organisationName, setOrganisationName] = React.useState('')
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const router = useRouter();

  async function onSubmit(event: React.SyntheticEvent) {
    event.preventDefault()
    setIsLoading(true)

    const formData = {
      first_name: firstName,
      last_name: lastName,
      organisation: { name: organisationName },
      email: email,
      password: password
    }

    try {
      await api.users.create(formData)
      router.push(`/admin/members`)
    } catch (error) {
      console.error(error)
    }

    setTimeout(() => {
      setIsLoading(false)
    }, 3000)
  }

  return (
    <div className={cn("grid gap-6", className)} {...props}>
      <form onSubmit={onSubmit}>
        <div className="grid gap-5">
          <div className="grid gap-5">
            <div className="flex flex-row gap-5" id="name">
              <Input
                id="first_name"
                placeholder="First Name"
                type="first_name"
                autoCapitalize="none"
                autoComplete="first_name"
                autoCorrect="off"
                disabled={isLoading}
                onChange={(e) => setFirstName(e.target.value)}
              />
              <Input
                id="last_name"
                placeholder="Last Name"
                type="last_name"
                autoCapitalize="none"
                autoComplete="last_name"
                autoCorrect="off"
                disabled={isLoading}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
            <Input
              id="organisation"
              placeholder="Company Name"
              type="organisation"
              autoCapitalize="none"
              autoComplete="organisation"
              autoCorrect="off"
              disabled={isLoading}
              onChange={(e) => setOrganisationName(e.target.value)}
            />
            <Input
              id="email"
              placeholder="name@workemail.com"
              type="email"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
              disabled={isLoading}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              id="password"
              placeholder="Password"
              type="password"
              autoCapitalize="none"
              autoComplete="password"
              autoCorrect="off"
              disabled={isLoading}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button disabled={isLoading}>
            {isLoading && (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            )}
            Create Account
          </Button>
        </div>
      </form>
    </div>
  )
}
