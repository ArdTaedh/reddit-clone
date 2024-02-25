'use client'

import { useRouter } from "next/navigation"
import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import axios, { AxiosError } from 'axios'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CreateSubredditPaylod } from "@/lib/validators/subreddit"
import { Loader2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import useCustomToast from "@/hooks/useCustomToast"

const page = () => {
    const [input, setInput] = useState<string>('')
    const router = useRouter()

    const { loginToast } = useCustomToast()

    const { mutate: createCommunity, isError, isLoading } = useMutation({
        mutationFn: async () => {
            const payload: CreateSubredditPaylod = {
                name: input
            }

            const { data } = await axios.post('/api/subreddit', payload)

            return data as string
        },
        onError: (e) => {
            if (e instanceof AxiosError) {
                if (e.response?.status === 409) {
                    return toast({
                        title: "Subreddit already exists.",
                        description: "Please choose a different subreddit name",
                        variant: "destructive"
                    })
                }

                if (e.response?.status === 422) {
                    return toast({
                        title: "Invalid Subreddit name.",
                        description: "Please choose a name between 3 and 21 characters",
                        variant: "destructive"
                    })
                }

                if (e.response?.status === 401) {
                    return loginToast()
                }
            }

            toast({
                title: "There was an error",
                description: "Could not create subreddit",
                variant: "destructive"
            })
        },
        onSuccess: (data) => {
            router.push(`/r/${data}`)
        }
    })

    return (
        <div
            className="container flex items-center h-full max-w-3xl mx-auto"
        >
            <div 
                className="relative bg-white w-full h-fit p-4 rounded-lg space-y-6"
            >
                <div 
                    className="flex justify-between items-center"
                >
                    <h1 
                        className="text-xl font-semibold"
                    >
                        Create a community
                    </h1>
                </div>

                <hr 
                    className="bg-zinc-500 h-px"
                />

                <div>
                    <p
                        className="text-xl font-medium"
                    >
                        Name
                    </p>
                    <p 
                        className="text-xs pb-2"
                    >
                        Community names including capitalization cannot be changed
                    </p>

                    <div 
                        className="relative"
                    >
                        <p 
                            className="absolute text-sm left-0 w-8 inset-y-0 grid place-items-center text-zinc-400"
                        >
                            r/
                        </p>
                        <Input 
                            className="pl-6 my-2"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                        />
                    </div>
                </div>

                <div
                    className="flex justify-end gap-4"
                >
                    <Button
                        variant="subtle"
                        onClick={() => router.back()}
                    >
                        Cancel
                    </Button>
                    <Button
                        disabled={isLoading || input.length === 0}
                        onClick={() => createCommunity()}
                    >
                        {
                            isLoading
                                ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                : null
                        }
                        Create Community
                    </Button>
                </div>
            </div>            
        </div>
    )
}

export default page