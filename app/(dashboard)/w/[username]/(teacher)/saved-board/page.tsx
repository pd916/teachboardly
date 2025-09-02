import React from 'react'
import { SessionBoardCard } from '../_component/session-card'
import { getSelf } from '@/lib/auth-service'
import { db } from '@/lib/db';
import NoSavedBoardSVG from '../_component/no-board';

const page = async () => {

  const self = await getSelf();

  const getSavedBoard = await db.board.findMany({
    where:{
      userId:self?.id,
      isArchived: true,
    }
  }) 

  return (
    <div>
      {getSavedBoard.length === 0 && (
    
      <div className="flex items-center justify-center py-16">
        <NoSavedBoardSVG className="h-60 w-60" />
      </div>
    )
  }
      {getSavedBoard?.map((board) => (
        <SessionBoardCard
        key={board.id}
        id={board.id}
        title={board.title}
        />
      ))}
    </div>
  )
}

export default page
