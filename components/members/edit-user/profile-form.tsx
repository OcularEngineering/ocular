"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"


import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription
} from "@/components/ui/form"

import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { User, userSchema } from "@/data/schema"
import { Button } from "@/components/ui/button"

type ProfileFormValues = z.infer<typeof userSchema>

interface ProfileFormProps {
  user: User;
}

export function ProfileForm({user}: ProfileFormProps) {

  const defaultValues: Partial<ProfileFormValues> = {
    bio: user.bio,
    first_name: user.first_name,
    last_name: user.last_name,
    email: user.email,
  }

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues,
    mode: "onChange",
  })

  function onSubmit(data: ProfileFormValues) {
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10 justify-center items-center">
        <FormField
          control={form.control}
          name="avatar"
          render={({ field }) => (
              <FormItem>
                  <FormLabel>Photo</FormLabel>
                  <FormControl>
                    <Avatar style={{width: '70px', height: '70px'}}>
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback>{user.first_name[0]}{user.last_name[0]}</AvatarFallback>
                    </Avatar>
                  </FormControl>
                  <FormMessage />
              </FormItem>
          )}
        />
        <div className="flex flex-row justify-between gap-5">
            <FormField
              control={form.control}
              name="first_name"
              render={({ field }) => (
                <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input style={{ width: '310px' }} placeholder="For example: Michael" {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="last_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input style={{ width: '310px' }}  placeholder="For example: Seibel" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
        </div>
        <div className="flex flex-row justify-between gap-5">
            <FormField
              control={form.control}
              name="pronouns"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pronouns</FormLabel>
                  <FormControl>
                    <Input style={{ width: '310px' }}  placeholder="For example: He/Him/His" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="job_title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Title</FormLabel>
                  <FormControl>
                    <Input style={{ width: '310px' }} placeholder="For example: Engineer" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
        </div>
        <div className="flex flex-row justify-between gap-5">
          <FormField
            control={form.control}
            name="depart_or_team"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Department or Team</FormLabel>
                <FormControl>
                  <Input style={{ width: '310px' }} placeholder="For example: Engineering" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input 
                    className="h-8 w-[150px] bg-muted lg:w-[310px]"
                    placeholder={user.email} {...field} 
                    disabled 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex flex-col justify-between gap-5 w-100">
          <FormField
            control={form.control}
            name="bio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>About me</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Tell us a little bit about yourself"
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>User role</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={user.role} 
                    className="flex flex-col space-y-1"
                  >
                    <div className="space-y-10">
                      <FormItem className="flex items-top space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="admin" />
                        </FormControl>
                        <div className="flex flex-col gap-2">
                          <FormLabel className="font-normal">
                            Admin
                          </FormLabel>
                          <FormDescription>
                            Admins can do everything, including accessing the admin console, managing members, and billing.
                          </FormDescription>
                        </div>
                      </FormItem>
                      <FormItem className="flex items-top space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="member" />
                        </FormControl>
                        <div className="flex flex-col gap-2">
                          <FormLabel className="font-normal">
                            Member
                          </FormLabel>
                          <FormDescription>
                            Members don't have access to the admin console, but have access to the premium features in Ocular.
                          </FormDescription>
                        </div>
                      </FormItem>
                    </div>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button type="submit">Update profile</Button>
      </form>
    </Form>
  )
}
