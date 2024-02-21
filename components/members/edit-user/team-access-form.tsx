"use client"

import * as z from "zod"

// Importing API End Points
import api2 from "@/services/api"
import api from "@/services/admin-api"
import React, { useEffect, useState } from 'react';
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { DataTable } from "./teams/data-table"
import { columns as baseColumns } from "./teams/columns"
import { User, Team, userSchema } from '@/data/schema'
import { Check } from 'lucide-react';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
  FormDescription
} from "@/components/ui/form"

type TeamAccessFormValues = z.infer<typeof userSchema>

interface TeamAccessFormProps {
  user: User
}

export function TeamAccessForm({user}: TeamAccessFormProps) {

  const [teams, setTeams] = useState<Team[]>([]);
  const [allteams, setAllTeams] = useState<Team[]>([]);
  const [combinedTeams, setCombinedTeams] = useState([]);
  const [organizationID, setOrganizationID] = useState('');

  const [buttonStates, setButtonStates] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchOrganizationID = async () => {
      try {
        const response = await api2.auth.loggedInUserDetails();
        if (response) {
          setOrganizationID(response.data.user.organisation_id);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchOrganizationID();
  }, []);

  useEffect(() => {
    const fetchOrganizationData = async (orgID: string) => {
      try {
        const response = await api.organisation.retrive(orgID, { expand: 'teams' });
        if (response) {
          setAllTeams(response.data.organisation.teams);
        }
      } catch (error) {
        console.error('Error fetching organization data:', error);
      }
    };

    if (organizationID) fetchOrganizationData(organizationID);
  }, [organizationID]);

  useEffect(() => {
    const fetchTeams = async (userID: string) => {
      try {
        const response = await api.users.retrieve(userID, { expand: 'teams' });
        setTeams(response.data.user.teams);
      } catch (error) {
        console.error('Error fetching user teams:', error);
      }
    };

    fetchTeams(user.id);
  }, [user.id]);

  useEffect(() => {
    const combinedData = allteams.map(team => ({
      ...team,
      belongsToUser: teams.some(userTeam => userTeam.id === team.id) ? "belongs to team" : "doesn't belong to team",
    }));
    setCombinedTeams(combinedData);
  }, [teams, allteams]);

  const form = useForm({
    resolver: zodResolver(userSchema),
    defaultValues: {
      bio: "I'm an engineer and I love to code!",
      fullname: user.name,
      email: user.email,
      id: user.id,
    },
    mode: "onChange",
  });

  function onSubmit(data: TeamAccessFormValues) {
    toast({
      title: "You submitted the following values:",
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    })
  }

  const columns = baseColumns.map(col => {
    if (col.id === 'actions') {
      return {
        ...col,
        cell: ({ row }) => {

          const teamID = row.original.id;
          const userEmail = user.email;
          const isOnTeam = row.original.belongsToUser === "belongs to team";

          return (
            <Button
              variant="outline"
              className={`flex h-8 gap-1 transition-colors duration-200 ${isOnTeam || buttonStates[row.original.id] ? "bg-gray-100 dark:bg-muted" : "border"}`}
              onClick={(event) => {
                event.stopPropagation();
                event.preventDefault();

                if (!isOnTeam && !buttonStates[row.original.id]) {

                  console.log(`Adding user to ${row.original.name}`);

                  api.teams.addmembers(teamID, {member_emails: [userEmail]})
                    .then(() => {
                      setButtonStates(prevState => ({...prevState, [teamID]: true}));
                    })
                    .catch((error) => {
                      console.error(error);
                    });
                } else {

                  console.log(`Removing user from ${row.original.name}`);

                  api.teams.removeMembers(teamID, {member_emails: [userEmail]})
                    .then(() => {
                      setButtonStates(prevState => ({...prevState, [teamID]: false}));
                    })
                    .catch((error) => {
                      console.error(error);
                    });
                }
              }}
            >
              {isOnTeam || buttonStates[row.original.id] ? <><Check size={18} /> On team</> : 'Add to team'}
            </Button>
          );
        },
      };
    }
    return col; 
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10 justify-center items-center">
        <FormField
          control={form.control}
          name="id"
          render={({ field }) => (
            <FormItem>
              <FormDescription className="mb-5">
                To edit {user.name}'s team access, search for a specific team or browse through the table to add or remove {user.name} to and from teams.
              </FormDescription>
              <FormControl>
                <DataTable data={combinedTeams} columns={columns} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  )
}
