"use client"

import useCustomToast from '@/hooks/useCustomToast'
import { usePrevious } from '@mantine/hooks'
import { CommentVote, VoteType } from '@prisma/client'
import React, { FC, useEffect, useState } from 'react'
import { Button } from '../ui/button'
import { ArrowBigDown, ArrowBigUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useMutation } from '@tanstack/react-query'
import { CommentVoteRequest, PostVoteRequest } from '@/lib/validators/votes'
import axios, { AxiosError } from 'axios'
import { toast } from '../ui/use-toast'
import { log } from 'console'

type PartialVote = Pick<CommentVote, 'type'>

interface CommentVotesProps {
    commentId: string,
    initalVoteAmount: number,
    initialVote: PartialVote
}

const CommentVotes: FC <CommentVotesProps> = ({ initalVoteAmount, initialVote, commentId }) => {
    const { loginToast } = useCustomToast()
    
    const [votesAmount, setVotesAmount] = useState<number>(initalVoteAmount)
    const [currVote, setCurrVote] = useState(initialVote)
    const prevVote = usePrevious(currVote)

    const { mutate: vote, isError, isSuccess } = useMutation({
        mutationFn: async (voteType: VoteType) => {
            const payload: CommentVoteRequest = {
                commentId,
                voteType
            }

            await axios.patch('/api/subreddit/post/comment/vote', payload)
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
        onMutate: (type) => {
            if (currVote?.type === type) {
                setCurrVote(undefined!)

                if (type === 'UP') {
                    setVotesAmount((prev) => prev - 1)
                } else {
                    setVotesAmount((prev) => prev + 1)
                }
            } else {
                setCurrVote({type})

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
            className='flex gap-1'
        >
            <Button
                onClick={() => vote('UP')}
                size='sm'
                variant="ghost"
                aria-label='upvote'
            >
                <ArrowBigUp 
                    className={cn('h-5 w-5 text-zinc-700', {
                        'text-emerald-500 fill-emerald-500': currVote?.type === 'UP'
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
                        'text-red-500 fill-red-500': currVote?.type === 'DOWN'
                    })}
                />
            </Button>
        </div>
    )
}

export default CommentVotes