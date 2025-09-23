"use client"
import { useBoardPresence } from '@/components/provider/provider';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import React from 'react'

interface HostProps{
    boardId:string | string[] | undefined
    hostId:string | undefined
    hostname: string | undefined
}

const Navabr = ({
    boardId,
    hostId,
    hostname
}:HostProps) => {

   const { endSession} = useBoardPresence(boardId, { id: hostId!, name:hostname, boardId })

const handleEndSession = () => {
  endSession()
  router.push(`/dashboard/${hostname}`) // host redirect
}


   const router = useRouter();

        return (
            <div className='min-h-14 flex items-center justify-between'>
                {hostId && (
                    <Button
                    variant="default"
                    className='ml-20'
                    onClick={handleEndSession}
                    size="sm"
                    >End Session</Button>
                )}

            </div>
        )
}

export default Navabr
