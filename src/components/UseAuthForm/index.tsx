'use client'

import React, { useState } from 'react'
import { Button } from '../ui/button'
import { cn } from '@/lib/utils'
import { signIn } from 'next-auth/react'
import { Icons } from '../Icons'
import { useToast } from '../ui/use-toast'
import { Loader2 } from 'lucide-react'

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {}

const UserAuthForm = ({ className, ...props }: UserAuthFormProps) => {
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const { toast } = useToast()

    const loginWithGoogleHandler = async () => {
        setIsLoading(true)

        try {
            await signIn('google')
        } catch (err) {
            toast({
                title: "There was a problem",
                description: "There was an eror logging with Google account",
                variant: "destructive"
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div
            className={cn('flex justify-center', className)}
            {...props}
        >
            <Button
                onClick={loginWithGoogleHandler}
                disabled={isLoading}
                size="sm"
                className='w-full'
            >
                {
                    isLoading 
                        ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        :   <Icons.google 
                                className='h-4 w-4 mr-2'
                            />
                }
                Google
            </Button>
        </div>
    )
}

export default UserAuthForm