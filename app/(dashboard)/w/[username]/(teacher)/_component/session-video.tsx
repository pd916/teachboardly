"use client"
import { Recording } from '@prisma/client'
import React from 'react'
import RecordingCard from './RecordingCard';
import NoVideosIllustration from './no-video';

interface RecordingWithBoard extends Recording {
  board: {
    title: string;
  } | null; // null if no board linked
}

interface SessionVideoProps {
  recentSession: RecordingWithBoard[];
}

const SessionVideo = ({recentSession}:SessionVideoProps) => {
   if (!recentSession || recentSession.length === 0) {
    return (
      <div className="flex min-h-[280px] w-full items-center justify-center">
        <div className="flex flex-col items-center text-center">
          <NoVideosIllustration className="h-56 w-72" />
          <p className="mt-4 text-sm text-gray-500">
            Record your first session to see it here.
          </p>
        </div>
      </div>
    );
  }
  return (
    <div className='flex items-center gap-2'>
      {recentSession.map((r) => (
        <RecordingCard
        key={r.id}
        videoUrl={r.videoUrl}
        id={r.id}
        createdAt={r.createdAt}
        title={r.board?.title}
        />
      ))}
    </div>
  )
}

export default SessionVideo
