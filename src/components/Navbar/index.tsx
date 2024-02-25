import Link from 'next/link'
import React from 'react'
import { Icons } from '../Icons'
import { getAuthSession } from '@/lib/auth'
import { signOut } from 'next-auth/react'
import LogoutButton from './LogoutButton'
import { buttonVariants } from '../ui/button'
import UserMenu from '../UserMenu'
import SearchBar from '../SearchBar'

const Navbar = async () => {
    const session = await getAuthSession()

    return (
        <header
            className='fixed top-0 inset-x-0 h-fit bg-zinc-100 border-zinc-300 z-[10] py-4'
        >
            <div
                className='container max-w-7xl h-full mx-auto flex items-center justify-between gap-2'
            >
                <Link
                    href='/'
                    className='flex gap-2 items-center'
                >
                    <Icons.logo
                        className='h-8 w-8 sm:h-6 sm:w-6'
                    />
                    <p
                        className="hidden text-zinc-700 text-sm font-medium md:block"
                    >
                        Reddit Clone
                    </p>
                </Link>

                <SearchBar />

                {
                    session?.user
                        ? <UserMenu  user={session.user} />
                        : (
                            <Link
                                className={buttonVariants()}
                                href='/sign-in'
                            >
                                Sign in
                            </Link>
                        )
                }

                

            </div>
        </header>
    )
}

export default Navbar