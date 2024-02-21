"use client"

import React, { useEffect, useState } from 'react';

// Importing API End Points
import api from "@/services/api"
import api2 from "@/services/admin-api"

import { columns } from "@/components/teams/columns"
import { DataTable } from "@/components/teams/data-table"
import SectionContainer from '@/components/section-container'
import { Separator } from "@/components/ui/separator"
import { Team } from "@/data/schema"

export const metadata = {
  title: "Teams",
  description: "Your organization teams.",
}


export default function Teams() {

  const [teams, setTeams] = useState<Team[]>([])
  const [organizationID, setOrganizationID] = React.useState('')

  async function fetchUserData(){
    try {
      const response = await api.auth.loggedInUserDetails();

      if (response) {
        setOrganizationID(response.data.user.organisation_id);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  }

  useEffect(() => {
    fetchUserData()
  }, [organizationID])

  async function fetchOrganizationData(organizationID: string){

    try {
      const response = await api2.organisation.retrive(organizationID, {expand: 'teams'});
      if (response) {
        setTeams(response.data.organisation.teams)
      }
    } catch (error) {
      console.error('Error fetching organization data:', error);
    }
  }

  useEffect(() => {
    fetchOrganizationData(organizationID)
  }, [organizationID])

  return (
    <>
      <div className="my-5 space-y-[40px] overflow-x-hidden">
        <div className="flex flex-col items-start justify-between space-y-[10px]">
          <h2 className="text-2xl font-bold tracking-tight mb-3">{metadata.title}</h2>
          <Separator />
        </div>
        <SectionContainer>
          <DataTable data={teams} columns={columns} />
        </SectionContainer>
      </div>
    </>
  )
}
