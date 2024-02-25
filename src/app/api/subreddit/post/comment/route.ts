import { getAuthSession } from "@/lib/auth"
import { db } from "@/lib/db"
import { CommentValidator } from "@/lib/validators/comment"
import { z } from "zod"

export const PATCH = async (req: Request) => {
    try { 
        const body = await req.json()

        const { postId, text, replyToId } = CommentValidator.parse(body)

        const session = await getAuthSession()

        if (!session) {
            return new Response('Unauthorized', { status: 401 })
        }

        await db.comment.create({
            data: {
                text,
                postId,
                authorId: session.user.id,
                replyToId
            }
        })

        return new Response('OK')
    } catch (e) {
        if (e instanceof z.ZodError) {
            return new Response('Invalid request data passed', { status: 422 })
        }

        return new Response('Could not create a comment. Please try again later', { status: 500 })
    }
}