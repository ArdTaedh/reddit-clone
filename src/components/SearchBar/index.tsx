'use client'

import { FC, useCallback, useEffect, useRef, useState } from "react"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "../ui/command"
import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import { Prisma, Subreddit } from "@prisma/client"
import { usePathname, useRouter } from "next/navigation"
import { Users } from "lucide-react"
import debounce from "lodash.debounce"
import { useOnClickOutside } from "@/hooks/use-on-click-outside"

interface SearchBarProps {

}

const SearchBar: FC<SearchBarProps> = ({  }) => {
    const [input, setInput] = useState<string>('')
    const router = useRouter()
    const pathname = usePathname()

    const commandRef = useRef<HTMLDivElement>(null)

    const { data, refetch, isFetched, isFetching } = useQuery({
        queryFn: async () => {
            if (!input) return []

            const { data } = await axios.get(`/api/search?q=${input}`)

            return data as (Subreddit & { _count: Prisma.SubredditCountOutputType })[]
        },
        queryKey: ['search-query'],
        enabled: false
    })

    const request = debounce(async () => {
        refetch()
    }, 300)

    const debouncedRequest = useCallback(() => {
        request()
    }, [])

    useOnClickOutside(commandRef, () => {
        setInput('')
    })

    useEffect(() => {
        setInput('')
    }, [pathname])

    return (
        <Command
            className="relative rounded-lg border max-w-lg z-50 overflow-visible"
            ref={commandRef}
        >
            <CommandInput
                className="outline-none border-none focus:border-none focus:outline-none ring-0"
                placeholder="Search communities..."
                value={input}
                onValueChange={(text) => {
                    setInput(text)
                    debouncedRequest()
                }}
            />

            {
                input.length > 0 
                    ? (
                        <CommandList
                            className="absolute bg-white top-full inset-x-0 shadow rounded-b-md"
                        >
                            {
                                isFetched && (  
                                    <CommandEmpty>
                                        No result found.
                                    </CommandEmpty> 
                                )
                            }
                            {
                                (data?.length ?? 0) > 0 
                                    ? (
                                        <CommandGroup
                                            heading='Communities'
                                        >
                                            {
                                                data?.map((subreddit) => (
                                                    <CommandItem
                                                        key={subreddit.id}
                                                        onSelect={(e) => {
                                                            router.push(`r/${e}`)
                                                            router.refresh()
                                                        }}
                                                        value={subreddit.name}
                                                    >
                                                        <Users 
                                                            className="mr-2 h-4 w-4"
                                                        />
                                                        <a 
                                                            href={`/r/${subreddit.name}`}
                                                        >
                                                            {subreddit.name}
                                                        </a>
                                                    </CommandItem>
                                                ))
                                            }
                                        </CommandGroup>
                                    )
                                    : null
                            }
                        </CommandList>
                    )
                    : null
            }
        </Command>
    )
}

export default SearchBar