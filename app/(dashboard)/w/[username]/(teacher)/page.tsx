import React from 'react'

import { db } from '@/lib/db'
import SessionVideo from './_component/session-video'
import { getSelf } from '@/lib/auth-service'

const Page = async () => {

  const self = await getSelf()

  const recentSession = await db.recording.findMany({
    where:{
      userId:self?.id,
    },
    include:{
      board: {
        select:{
          title:true
        }
      }
    },
    orderBy:{
      createdAt: "desc"
    }
  })

  return (
    <div className='space-y-12'>
      <SessionVideo
      recentSession={recentSession}
      />
    </div>
  )
}

export default Page
