import { buttonVariants } from '@/components/ui/button'
import { toast } from '@/components/ui/use-toast'
import Link from 'next/link'
import React from 'react'

const useCustomToast = () => {
    const loginToast = () => {
        const { dismiss } = toast({
            title: "Login Required.",
            description: "You need to be logged in to to that.",
            variant: 'destructive',
            action: (
                <Link
                    onClick={() => dismiss()}
                    className={buttonVariants({
                        variant: "outline"
                    })}
                    href='/sign-in'
                >
                    Login
                </Link>
            )
        })
    }

    return { loginToast }
}

export default useCustomToast