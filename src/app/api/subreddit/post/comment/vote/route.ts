import { getAuthSession } from "@/lib/auth"
import { db } from "@/lib/db"
import { redis } from "@/lib/redis"
import { ComentVoteValidator, PostVoteValidator } from "@/lib/validators/votes"
import { CachedPost } from "@/types/reddis"
import { z } from "zod"


export const PATCH = async (req: Request) => {
    try {
        const body = await req.json()

        const { commentId, voteType } = ComentVoteValidator.parse(body)

        const session = await getAuthSession()

        if (!session?.user) {
            return new Response('Unauthorized', { status: 401 })
        }

        const existingVote = await db.commentVote.findFirst({
            where: {
                userId: session.user.id,
                commentId
            }
        })

        if (existingVote) {
            if (existingVote.type === voteType) {
                await db.commentVote.delete({
                    where: {
                        userId_commentId: {
                            commentId,
                            userId: session.user.id
                        }
                    }
                })

                return new Response('OK')
            } else {
                await db.commentVote.update({
                    where: {
                        userId_commentId: {
                            commentId,
                            userId: session.user.id
                        }
                    },  
                    data: {
                        type: voteType
                    }
                })
            }

            return new Response('OK')
        }

        await db.commentVote.create({
            data: {
                type: voteType,
                userId: session.user.id,
                commentId
            }
        })

        return new Response("OK")
    } catch (e) {
        if (e instanceof z.ZodError) {
            return new Response('Invalid request data passed', { status: 422 })
        }

        return new Response('Could not register your vote. Please try again later', { status: 500 })
    }
}