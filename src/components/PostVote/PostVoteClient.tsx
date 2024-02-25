"use client"

import useCustomToast from '@/hooks/useCustomToast'
import { usePrevious } from '@mantine/hooks'
import { VoteType } from '@prisma/client'
import React, { FC, useEffect, useState } from 'react'
import { Button } from '../ui/button'
import { ArrowBigDown, ArrowBigUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useMutation } from '@tanstack/react-query'
import { PostVoteRequest } from '@/lib/validators/votes'
import axios, { AxiosError } from 'axios'
import { toast } from '../ui/use-toast'

interface PostVoteCLientProps {
    postId: string,
    initalVoteAmount: number,
    initialVote: VoteType
}

const PostVoteClient: FC <PostVoteCLientProps> = ({ initalVoteAmount, initialVote, postId }) => {
    const { loginToast } = useCustomToast()
    
    const [votesAmount, setVotesAmount] = useState<number>(initalVoteAmount)
    const [currVote, setCurrVote] = useState(initialVote)
    const prevVote = usePrevious(currVote)

    useEffect(() => {
        setCurrVote(initialVote)
    }, [initialVote])

    const { mutate: vote, isError, isSuccess } = useMutation({
        mutationFn: async (voteType: VoteType) => {
            const payload: PostVoteRequest = {
                postId,
                voteType
            }

            await axios.patch('/api/subreddit/post/vote', payload)
        },
        onError: (err, voteType) => {
            if (voteType === 'UP') {
                setVotesAmount((prev) => prev - 1)
            } else {
                setVotesAmount((prev) => prev + 1)
            }
                
            setCurrVote(prevVote!)

            if (err instanceof AxiosError) {
                if (err.response?.status === 401) {
                    return loginToast()
                }
            }

            return toast({
                title: "Something went wrong",
                description: "Your vote was not registered, please try again later",
                variant: "destructive"
            })
        },
        onMutate: (type: VoteType) => {
            if (currVote === type) {
                setCurrVote(undefined!)

                if (type === 'UP') {
                    setVotesAmount((prev) => prev - 1)
                } else {
                    setVotesAmount((prev) => prev + 1)
                }
            } else {
                setCurrVote(type)

                if (type === "UP") {
                    setVotesAmount((prev) => prev + (currVote ? 2: 1))
                } else {
                    setVotesAmount((prev) => prev - (currVote ? 2: 1))
                }
            }
        }
    })

    return (
        <div
            className='flex sm:flex-col gap-4 sm:gap-0 pr-6 sm:w-20 pb-4 sm:pb-0'
        >
            <Button
                onClick={() => vote('UP')}
                size='sm'
                variant="ghost"
                aria-label='upvote'
            >
                <ArrowBigUp 
                    className={cn('h-5 w-5 text-zinc-700', {
                        'text-emerald-500 fill-emerald-500': currVote === 'UP'
                    })}
                />
            </Button>

            <p 
                className="text-center py-2 font-medium text-sm text-zinc-900"
            >
                {votesAmount}
            </p>

            <Button
                onClick={() => vote('DOWN')}
                size='sm'
                variant="ghost"
                aria-label='downvote'
            >
                <ArrowBigDown 
                    className={cn('h-5 w-5 text-zinc-700', {
                        'text-red-500 fill-red-500': currVote === 'DOWN'
                    })}
                />
            </Button>
        </div>
    )
}

export default PostVoteClient