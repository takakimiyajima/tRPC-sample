import { createTRPCRouter , publicProcedure } from "@/server/api/trpc"
import { userSchema } from "@/validations/user"

export const userRouter = createTRPCRouter({
  getByUserId: publicProcedure
    .input(userSchema)
    .query(async ({ ctx, input }) => {
      return await ctx.db.user.findUnique({
        where: {
          id: input.userId
        },
        select: {
          id: true,
          name: true,
          image: true,
          followers: {
            select: {
              id: true,
              userId: true,
              target: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                },
              },
              user: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                },
              },
            },
          },
          following: {
            select: {
              id: true,
              userId: true,
              target: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                },
              },
            },
          },
        },
      });
    }),
})