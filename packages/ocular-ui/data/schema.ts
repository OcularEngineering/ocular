import { z } from "zod"

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
});

export type User = z.infer<typeof userSchema>
