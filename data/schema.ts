import { z } from "zod"

export const teamSchema = z.lazy(() => z.object({
  id: z.string(),
  name: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
  organisation_id: z.string(),
  description: z.string().optional(),
  members: z.array(userSchema),
}));

export const userSchema = z.object({
  id: z.string(),
  email: z.string(),
  first_name: z.string(),
  last_name: z.string(),
  pronouns: z.string().optional(),
  role: z.string(),
  organisation_id: z.string(),
  job_title: z.string().optional(),
  depart_or_team: z.string().optional(),
  created_at: z.string(),
  updated_at: z.string(),
  avatar: z.string(),
  metadata: z.unknown().optional(),
  bio: z.string().optional(),
  teams: z.array(teamSchema).optional(),
});

export type User = z.infer<typeof userSchema>
export type Team = z.infer<typeof teamSchema>
