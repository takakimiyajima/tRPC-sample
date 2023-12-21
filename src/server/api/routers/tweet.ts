import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/server/api/trpc"
import {
  cursorBasedPaginationSchema,
  tweetContentSchema,
  tweetUserIdSchema,
} from "@/validations/tweet"

export const tweetRouter = createTRPCRouter({
  create: protectedProcedure
    .input(tweetContentSchema)
    .mutation(async ({ ctx, input }) => {
      const { content } = input
      const { user } = ctx.session

      return await ctx.db.tweet.create({
        data: {
          content,
          userId: user.id
        },
        include: {
          from: {
            select: {
              id: true,
              name: true,
              image: true,
            }
          },
          likes: true
        }
      })
    }),
  getAllByUserId: publicProcedure
    .input(tweetUserIdSchema)
    .query(async ({ ctx, input }) => {
      return await ctx.db.tweet.findMany({
        where: {
          userId: input.userId
        },
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          from: {
            select: {
              id: true,
              name: true,
              image: true,
            }
          },
          likes: true,
        }
      })
    }),
  getAll: publicProcedure
    .input(cursorBasedPaginationSchema)
    .query(async ({ ctx, input }) => {
      const take = 10
      const { cursor } = input
      const tweets = await ctx.db.tweet.findMany({ 
        take: take + 1,
        orderBy: {
          createdAt: 'desc'
        },
        cursor: cursor ? { id: cursor } : undefined,
        include: {
          from: {
            select: {
              id: true,
              name: true,
              image: true
            }
          },
          likes: true
        }
      })
      // Cursor-based pagination
      let nextCursor: typeof cursor = undefined
      if (tweets.length > take) {
        const nextTweet = tweets.pop()
        nextCursor = nextTweet?.id
      }
      
      return {
        tweets,
        nextCursor
      }
    })
})
