"use client"
import { useSocket } from '@/components/provider/socket-provider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import React from 'react'

interface HostProps{
    boardId:string | string[] | undefined
    hostId:string | undefined
}

const Navabr = ({
    boardId,
    hostId
}:HostProps) => {
   const {isConnected, socket} = useSocket();

   const router = useRouter();

    const handleEndSession = () => {
        if (!socket || !isConnected) return;
        
        // Emit end session event
        socket.emit("end-session", { boardId, hostId });
        
        // Redirect host to dashboard
        router.push('/dashboard'); // Adjust path as needed
    };

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

                <div className='flex items-center justify-end px-12 py-3'>
                    {isConnected ? (
                <Badge variant="outline" className="bg-emerald-600 text-white border-none">
                Live: Ral-time updates
               </Badge>
                ):(
                <Badge variant="outline" className="bg-yellow-600 text-white border-none">
                Fallback: Polling every is
                </Badge>
                )}
                </div>
            </div>
        )
}

export default Navabr
