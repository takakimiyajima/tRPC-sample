import { useRouter } from 'next/router'
import { useSession } from 'next-auth/react'
import Error from 'next/error'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import produce from 'immer'
import { DefaultLayout } from '@/components/DefaultLayout'
import { UserIcon } from '@/components/UserIcon'
import { TweetList } from '@/components/TweetList'
import { api } from '@/utils/api'
import { tweetContentSchema, type TweetContentSchema } from '@/validations/tweet'

export default function UserIdIndex() {
  const router = useRouter()
  const { data: session } = useSession()

  const {
    register,
    handleSubmit,
    formState: { isValid },
    reset
  } = useForm({
    resolver: zodResolver(tweetContentSchema),
    defaultValues: { content: '' }
  })

  const userId = String(router.query.userId)
  const {
    data: user,
    isLoading: isLoadingUser
  } = api.user.getByUserId.useQuery(
    { userId },
    { enabled: router.isReady }
  )

  const {
    data: tweets = [],
    isLoading: isLoadingTweets
  } = api.tweet.getAllByUserId.useQuery(
    { userId },
    { enabled: router.isReady },
  )

  const utils = api.useUtils()
  const tweetCreateMutation = api.tweet.create.useMutation()
  const tweetLinkLikeOrUnlikeMutation = api.tweetLink.likeOrUnlike.useMutation()

  if (isLoadingUser)
    return (
      <DefaultLayout session={session}>
        <div>Loading...</div>
      </DefaultLayout>
    )
  
  if (!user) {
    return <Error statusCode={404} />
  }

  const onSubmit = ({ content }: TweetContentSchema) => {
    if (tweetCreateMutation.isLoading) return
    
    tweetCreateMutation.mutate(
      { content },
      {
        onSuccess: (data) => {
          utils.tweet.getAllByUserId.setData(
            { userId: data.userId },
            [ data, ...tweets ]
          )
        },
      // onError: () => {}
      }
    )
    reset()
  }

  const handleClickLike = (tweetId: string) => {
    if (!session) {
      alert('ログイン')
      return
    }
    if (tweetLinkLikeOrUnlikeMutation.isLoading) return

    tweetLinkLikeOrUnlikeMutation.mutate(
      { tweetId },
      {
        onSuccess: (data) => {
          utils.tweet.getAllByUserId.setData({ userId }, (old) =>
            produce(old, (draft) => {
              const tweet = draft?.find((t) => t.id === tweetId)
              if (!tweet) return draft
              const likeIndex = tweet.likes.findIndex((like) => like.userId === data.userId)
              likeIndex === -1
                ? tweet.likes.push(data)
                : tweet.likes.splice(likeIndex, 1)
            }),
          )
        }
      }
    )
  }

  return (
    <DefaultLayout session={session}>
      <div className="flex flex-col gap-2">
        <div className="flex items-end justify-between">
          <div className="h-24 w-24">
            <UserIcon {...user} />
          </div>
        </div>
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold">{user?.name ?? "no name"}</h1>
          <div className="text-slate-70 ">@{user?.id ?? "- -"}</div>
        </div>
      </div>
      <div className="mt-4">
        {userId === session?.user.id && (
          <form onSubmit={(e) => void handleSubmit(onSubmit)(e)} className="flex flex-col items-end gap-2">
            <textarea
              {...register("content")}
              rows={4}
              className="block w-full rounded-lg border border-gray-30 p-2.5 text-sm text-slate-900"
              placeholder="What's happening??"
              minLength={1}
              maxLength={140}
            >
            </textarea>
            <button
              className="rounded-full bg-sky-500 px-5 py-3 text-white disabled:opacity-50"
              disabled={!isValid || tweetCreateMutation.isLoading}
            >
              Post
            </button>
          </form>
        )}
      </div>
      <div>
        <h2 className="mb-2 font-bold">Posts</h2>
        <TweetList
          tweets={tweets}
          isLoading={isLoadingTweets}
          handleClickLike={handleClickLike}
          currentUserId={session?.user.id}
        />
      </div>
    </DefaultLayout>
  )
}
