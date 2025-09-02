"use client"
import { useSocket } from '@/components/provider/socket-provider';
import { Badge } from '@/components/ui/badge';
import React from 'react'


const Navabr = ({
}) => {
   const {isConnected} = useSocket();
        return (
            <div className='min-h-14'>
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
