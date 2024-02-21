"use client"

import * as z from "zod"

// Importing API End Points
import api from "@/services/admin-api"

import React, { use, useEffect, useState } from 'react';
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "@/components/ui/use-toast"
import { DataTable } from "./members/data-table"
import { columns } from "./members/columns"
import { User, Team, teamSchema } from "@/data/schema"

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
  FormDescription
} from "@/components/ui/form"


type MembersFormValues = z.infer<typeof teamSchema>

interface MembersFormProps {
    team: Team
}

export function MembersForm({team}: MembersFormProps) {

    const [users, setUsers] = useState<User[]>([])

    const defaultValues: Partial<MembersFormValues> = {
        members: team.members,
        name: team.name,
        id: team.id
    }

    async function fetchTeamMembers(teamID: string){
        console.log("team id 1: ", team.id)
        try {
            const response = await api.teams.retrieve(teamID, {expand: 'members'});

            console.log("Response: ", response)

            setUsers(response.data.team.members);

        } catch (error) {
            console.error('Error fetching team members:', error);
        }

    }

    useEffect(() => {
        fetchTeamMembers(team.id)
    }, [team.id])

    const form = useForm<MembersFormValues>({
        resolver: zodResolver(teamSchema),
        defaultValues,
        mode: "onChange",
    })

    function onSubmit(data: MembersFormValues) {
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
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10 justify-center items-center max-h-[1000px]">
              <FormField
                control={form.control}
                name="members"
                render={({ field }) => (
                  <FormItem>
                    <FormDescription className="mb-5">
                      Add users to the {team.name} team.
                    </FormDescription>
                    <FormControl>
                        <DataTable data={users} columns={columns} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
          </form>
        </Form>
    )
}
