import MiniCreatePost from '@/components/MiniCreatePost'
import PostFeed from '@/components/PostFeed'
import { INFINITE_SCROLLING_PAGINATION_RESULTS } from '@/config'
import { getAuthSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import React, { FC } from 'react'

interface slugPageProps {
    params: {
        slug: string
    }
}

export async function generateMetadata({ params }: slugPageProps) {
    return {
      title: params.slug
    }
}

const page = async ({ params }: slugPageProps) => {
    const { slug } = params

    const session = await getAuthSession()

    const subreddit = await db.subreddit.findFirst({
        where: {
            name: slug
        },
        include: {
            posts: {
                include: {
                    author: true,
                    votes: true,
                    comments: true,
                    subreddit: true
                },
                orderBy: {
                    createdAt: 'desc'
                }
            }
        },
        take: INFINITE_SCROLLING_PAGINATION_RESULTS
    })

    if (!subreddit) {
        return notFound()
    }

    return (
        <div>
            <h1 
                className="font-bold text-3xl md:text-4xl h-14"
            >
                r/{subreddit.name}
            </h1>
            <MiniCreatePost 
                session={session}
            />
            <PostFeed 
                initialPosts={subreddit.posts}
                subredditName={subreddit.name}
            />
        </div>
    )
}

export default page