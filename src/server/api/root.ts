import { createTRPCRouter } from '@/server/api/trpc'
import { tweetRouter } from '@/server/api/routers/tweet'
import { tweetLinkRouter } from '@/server/api/routers/tweetLink'
import { userRouter } from '@/server/api/routers/user'

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  tweet: tweetRouter,
  tweetLink: tweetLinkRouter,
  user: userRouter,
})

// export type definition of API
export type AppRouter = typeof appRouter
