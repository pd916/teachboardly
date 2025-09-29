'use client'
import React, { useState } from 'react'
import { Button } from './ui/button'
import UserAvatar from './UserAvatar'
import { useParams } from 'next/navigation'
import { Badge } from './ui/badge'
import { useBoardPresence } from './provider/provider'

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
  const params = useParams();
  const { kickMember, handleDrawingPermission} = useBoardPresence(params?.boardId, {
  id: id,        // make sure it's a string, not undefined
  name: name,
  boardId: params?.boardId
})

const [localAllowed, setLocalAllowed] = useState(false)

    const handleDrawingPermissionToggle = (userId: string) => {
      if (!userId) return;
    const next = !localAllowed
    setLocalAllowed(next)                 // flip button label
    handleDrawingPermission(userId, next)    // broadcast to that user
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
        variant={localAllowed ? 'destructive' : 'primary'} 
        size="sm" 
         onClick={() => handleDrawingPermissionToggle(id!)}
        aria-label={`Kick ${name || "user"}`}
        >
          {localAllowed ? "undraw" : "can darw"}
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
