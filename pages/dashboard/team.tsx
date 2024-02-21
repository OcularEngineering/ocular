import { promises as fs } from "fs"
import path from "path"
import { z } from "zod"

import { columns } from "@/components/members/columns"
import { DataTable } from "@/components/members/data-table"
import { userSchema } from "@/data/schema"

export const metadata = {
  title: "Team",
  description: "A table of team users.",
}

async function getUsers() {
  const data = await fs.readFile(
    path.join(process.cwd(), "/data/team.json")
  )

  const users = JSON.parse(data.toString())

  return z.array(userSchema).parse(users)
}

export async function getStaticProps() {
  const users = await getUsers()

  return {
    props: { users }, 
  }
}

export default function Team({ users }) {
  return (
    <div className="my-10 w-full space-y-[40px]">
      <div className="flex flex-col items-start justify-between space-y-[10px]">
        <h2 className="text-2xl font-bold tracking-tight">Team</h2>
        <p className="text-muted-foreground">
          Here&apos;s a list of your team members.
        </p>
      </div>
      <div className="w-full max-w-4xl flex-1">
        <DataTable data={users} columns={columns} />
      </div>
    </div>
  )
}
