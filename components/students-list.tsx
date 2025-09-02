'use client'
import React, { useState } from 'react'
import { Button } from './ui/button'
import UserAvatar from './UserAvatar'
import { useParams } from 'next/navigation'
import { useSocket } from './provider/socket-provider'
import { Badge } from './ui/badge'

interface StudentsListProps {
    id?: string
    name?: string
    adminId?:string
}

const StudentsList = ({
    id,
    name,
    adminId
}:StudentsListProps) => {
  const {socket} = useSocket();
  const params = useParams();
  const [isDrawingEnabled, setIsDrawingEnabled] = useState(false);
    console.log(params?.boardId, "memb")

  const kickMember = (id:string) => {
    if(!id || !socket) return;

    socket.emit("kick-member", {
      id,
      boardId:params?.boardId
    })

  }

  const handleDrawingPermission = (id: string) => {
    if(!socket) return;
    
    const newStatus = !isDrawingEnabled;
    setIsDrawingEnabled(newStatus);
    console.log(id, newStatus, 'usersidddd')

    socket.emit('can-draw', {
      id,
      boardId:params?.boardId,
      allowed: newStatus,
    } )
  }

  return (
    <div className="flex items-center justify-between gap-4 p-3 rounded-md transition">
      <div className="flex items-center gap-3">
       <UserAvatar imageUrl={""}/>
        <div>
          <p className="text-sm font-semibold text-gray-900">
            {name || "Unknown User"}
             {id === adminId && <Badge variant="secondary">Admin</Badge>}
            </p>
        </div>
      </div>
      {id !== adminId && (
        <div className='flex gap-2'>
        <Button 
        variant={isDrawingEnabled ? 'destructive' : 'primary'} 
        size="sm" 
        onClick={() => handleDrawingPermission(id!)}
        aria-label={`Kick ${name || "user"}`}
        >
          {isDrawingEnabled ? "undraw" : "can darw"}
      </Button>
        <Button 
        variant="destructive" 
        size="sm" 
        onClick={() => kickMember(id!)}
        aria-label={`Kick ${name || "user"}`}
        >
        Kick
      </Button>
        </div>
      )}
    </div>
  )
}

export default StudentsList
