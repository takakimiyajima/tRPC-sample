import { z } from 'zod'

export const userSchema = z.object({
  userId: z.string(),
})

export type UserSchema = z.infer<typeof userSchema>