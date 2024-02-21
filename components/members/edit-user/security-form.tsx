"use client"

import * as z from "zod"

import { zodResolver } from "@hookform/resolvers/zod"
import { useFieldArray, useForm } from "react-hook-form"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ExclamationTriangleIcon } from "@radix-ui/react-icons"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { User } from "@/data/schema"

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription
} from "@/components/ui/form"

const SecurityFormSchema = z.object({
  fullname: z
    .string()
    .min(2, {
      message: "Fullname must be at least 2 characters.",
    })
    .max(100, {
      message: " Fullname must not be longer than 100 characters.",
    }),
  access: z
    .string()
    .min(2, {
      message: "Pronouns must be at least 2 characters.",
    })
    .max(100, {
      message: " Pronouns must not be longer than 100 characters.",
    }),
  jobTitle: z
    .string(),
  departmentOrTeam: z
    .string(),
  email: z
    .string({
      required_error: "Please enter your work email.",
    })
    .email(),
  bio: z.string().max(160).min(4),
  urls: z
    .array(
      z.object({
        value: z.string().url({ message: "Please enter a valid URL." }),
      })
    )
    .optional(),
    type: z.enum(["Admin", "Member"]),
})

type SecurityFormValues = z.infer<typeof SecurityFormSchema>

interface SecurityFormProps {
    user: User;
}

export function SecurityForm({user}: SecurityFormProps) {

  const defaultValues: Partial<SecurityFormValues> = {
    bio: "I'm an engineer and I love to code!",
    fullname: user.name,
    email: user.email,
  }

  const form = useForm<SecurityFormValues>({
    resolver: zodResolver(SecurityFormSchema),
    defaultValues,
    mode: "onChange",
  })

  const { fields, append } = useFieldArray({
    name: "urls",
    control: form.control,
  })

  function onSubmit(data: SecurityFormValues) {
    toast({
      title: "You submitted the following values:",
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 justify-center items-center">
        <FormField
          control={form.control}
          name="access"
          render={({ field }) => (
            <FormItem className="flex flex-row">
              <div className="flex flex-col items-start w-full gap-3">
                <FormLabel>Password</FormLabel>
                <FormDescription>Reset password for this account</FormDescription>
              </div>
              <FormControl>
                <Button
                    variant="outline"
                    className="flex h-8 data-[state=open]:bg-muted"
                  >
                    Reset password
                </Button>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="access"
          render={({ field }) => (
            <FormItem className="space-y-5">
              <div className="flex flex-col items-start w-full gap-3">
                <FormLabel>Access</FormLabel>
                <FormDescription>Control access to this account</FormDescription>
              </div>
              <FormControl>
                <div className="flex items-center space-x-2">
                  <Switch id="lock-account" />
                  <Label htmlFor="lock-account">Lock Account</Label>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="access"
          render={({ field }) => (
            <FormItem className="space-y-5">
              <div className="flex flex-col items-start w-full gap-3">
                <FormDescription>
                  <Alert variant="destructive">
                    <ExclamationTriangleIcon className="h-4 w-4" />
                    <AlertTitle>Warning</AlertTitle>
                    <AlertDescription>
                      Deleting this account is permanent and cannot be undone.
                    </AlertDescription>
                  </Alert>
                </FormDescription>
              </div>
              <FormControl>
                <Button
                  variant="destructive"
                  className="flex h-8 data-[state=open]:bg-muted text-white"
                >
                  Delete account
                </Button>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* <Button type="submit">Save changes</Button> */}
      </form>
    </Form>
  )
}
