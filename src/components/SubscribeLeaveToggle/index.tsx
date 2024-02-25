'use client'

import { useMutation } from "@tanstack/react-query"
import { Button } from "../ui/button"
import { SubscribeToSubredditpPaylod } from "@/lib/validators/subreddit"
import { FC, startTransition } from "react"
import axios, { AxiosError } from "axios"
import useCustomToast from "@/hooks/useCustomToast"
import { toast } from "../ui/use-toast"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

interface SubscribeLeaveToggleProps  {
    subredditId: string
    subredditName: string
    isSubscribed: boolean
}

const SubscribeLeaveToggle:FC<SubscribeLeaveToggleProps> = ({ subredditId, subredditName, isSubscribed }) => {
    const { loginToast } = useCustomToast()
    const router = useRouter()

    const { isLoading: subscribeLoading, mutate: subscribe } = useMutation({
        mutationFn: async () => {
            const payload: SubscribeToSubredditpPaylod = {
                subredditId
            }

            const { data } = await axios.post('/api/subreddit/subscribe', payload)

            return data as string
        },
        onError: (e) => {
            if (e instanceof AxiosError) {
                if (e.response?.status === 401) {
                    return loginToast()
                }
            }

            return toast({
                title: "There was an error",
                description: "Something went wrong, please try again.",
                variant: "destructive"
            })
        },
        onSuccess: () => {
            startTransition(() => { 
                router.refresh()
            })

            return toast({
                title: "Subscribed",
                description: `You're now subscribed to r/${subredditName}`
            })
        }
    })

    const { isLoading: unsubscribeLoading, mutate: unsubscribe } = useMutation({
        mutationFn: async () => {
            const payload: SubscribeToSubredditpPaylod = {
                subredditId
            }

            const { data } = await axios.post('/api/subreddit/unsubscribe', payload)

            return data as string
        },
        onError: (e) => {
            if (e instanceof AxiosError) {
                if (e.response?.status === 401) {
                    return loginToast()
                }
            }

            return toast({
                title: "There was an error",
                description: "Something went wrong, please try again.",
                variant: "destructive"
            })
        },
        onSuccess: () => {
            startTransition(() => { 
                router.refresh()
            })

            return toast({
                title: "Unsubscribed",
                description: `You're now unsubscribed to r/${subredditName}`
            })
        }
    })



    return isSubscribed
        ?   (<Button
                onClick={() => unsubscribe()}
                className="w-full mt-1 mb-4"
                disabled={unsubscribeLoading}
            >
                  {
                    unsubscribeLoading
                        ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        : null
                }
                Leave community
            </Button>)
        :   (<Button
                className="w-full mt-1 mb-4"
                onClick={() => subscribe()}
                disabled={subscribeLoading}
            >
                {
                    subscribeLoading
                        ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        : null
                }
                Join to post
            </Button>)
}

export default SubscribeLeaveToggle