import { z } from 'zod'

export const tweetContentSchema = z.object({
  content: z.string().min(1).max(140),
})
export type TweetContentSchema = z.infer<typeof tweetContentSchema>

export const tweetUserIdSchema = z.object({
  userId: z.string(),
})
export type TweetUserIdSchema = z.infer<typeof tweetUserIdSchema>

/** For Cursor-based pagination */
export const cursorBasedPaginationSchema = z.object({
  cursor: z.string().nullish()
})
