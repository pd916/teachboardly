"use client"
import { Button } from '@/components/ui/button'
import UserAvatar from '@/components/UserAvatar'
import { useModelStore } from '@/hooks/use-model'
import { Clapperboard } from 'lucide-react'
import { signOut, useSession } from 'next-auth/react'
import Link from 'next/link'
import React, { useEffect } from 'react'

const Actions = () => {
    const { data: session, update} = useSession()
    const {onOpen} = useModelStore((state) => state);
    const user = session?.user;
    // const role = user?.role;

    useEffect(() => {
        const handleProfileUpdate = async () => {
            await update();
        };

        window.addEventListener('profileUpdated', handleProfileUpdate);
        
        return () => {
            window.removeEventListener('profileUpdated', handleProfileUpdate);
        };
    }, [update]);

  return (
    <div className='flex items-center justify-end gap-x-2 ml-4 lg:ml-0'>
        {!user ? (
            <>
            <Link href={'/sign-up'}>
                <Button
                variant="primary"
                className='text-white'
                >
                    sign-up
                </Button>
            </Link>
             <Button 
                variant="outline"
                onClick={() => onOpen("joinLink")}
                className='text-muted-foreground hover:text-primary'
                >Join Board</Button>
        </>
        ): (
                <div className='flex items-center gap-x-4'>
                 
                <Button
                size="sm"
                variant="ghost"
                className='text-muted-foreground hover:text-primary'
                asChild
                > 
                    <Link href={`/w/${user?.name}`}>
                    <Clapperboard className='h-5 w-5 lg:mr-2'/>
                    <span className='hidden lg:block'>Dashboard</span>
                    </Link>
                </Button>
                <UserAvatar
                  key={`${user?.image}-${Date.now()}`}
                 imageUrl={user?.image}/>
            </div>
        )}
       
        
    </div>
  )
}

export default Actions
