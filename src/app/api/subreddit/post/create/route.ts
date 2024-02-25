import { getAuthSession } from "@/lib/auth"
import { db } from "@/lib/db"
import { PostValidator } from "@/lib/validators/post"
import { SubredditSubscriptionValidator } from "@/lib/validators/subreddit"
import { z } from "zod"

export const POST = async (req: Request) => {
    try {
        const session = await getAuthSession()

    if (!session?.user) {
        return new Response('Unauthorized', { status: 401 })
    }

    const body = await req.json()

    const { subredditId, title, content } = PostValidator.parse(body)

    const subscriptionExists = await db.subscription.findFirst({
        where: {
            subredditId,
            userId: session.user.id
        }
    })

    if (!subscriptionExists) {
        return new Response('Subscribe to post', { status: 400 })
    }

    await db.post.create({
        data: {
            subredditId,
            authorId: session.user.id,
            title,
            content,
        }
    })

    return new Response('OK')
    } catch (e) {
        if (e instanceof z.ZodError) {
            return new Response('Invalid request data passed', { status: 422 })
        }

        return new Response('Could not post to subreddit. Please try again later', { status: 500 })
    }
}