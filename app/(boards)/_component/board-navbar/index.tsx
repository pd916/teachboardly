"use client"
import { deleteBoardOnLeave } from '@/actions/board';
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

   const router = useRouter();
   
const handleEndSession = async () => {
  endSession()
  router.push(`/w/${hostname}`) // host redirect
  await deleteBoardOnLeave(boardId as string)
}



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
