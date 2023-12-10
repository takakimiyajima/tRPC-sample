import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/server/api/trpc"
import { tweetContentSchema, tweetUserIdSchema } from "@/validations/tweet"

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
    .query(({ ctx, input }) => {
      return ctx.db.tweet.findMany({
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
    })
})
