import { createTRPCRouter , publicProcedure } from "@/server/api/trpc"
import { userSchema } from "@/validations/user"

export const userRouter = createTRPCRouter({
  getByUserId: publicProcedure
    .input(userSchema)
    .query(async ({ ctx, input }) => {
      return await ctx.db.user.findUnique({
        where: {
          id: input.userId
        }
      })
    })
})
