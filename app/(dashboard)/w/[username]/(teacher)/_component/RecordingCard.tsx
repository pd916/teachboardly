"use client"
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import React from 'react'

interface RecordingCardProps {
  id: string,
  title?: string,
  videoUrl: string,
  createdAt: Date
}

const RecordingCard = ({
  id,
  title,
  videoUrl,
  createdAt
}: RecordingCardProps) => {

    console.log(videoUrl, "vidoes")
  // Format the createdAt date nicely
  const formattedDate = new Date(createdAt).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })

  return (
    <Card className="w-full max-w-sm rounded-xl bg-gray-100">
      <CardContent className="p-4">
        {/* Video player */}
        <video 
          className="w-full h-32 rounded-md mb-4 bg-black"
          src={videoUrl}
          controls
          preload="metadata"
        />
        <div className="flex justify-between text-sm font-medium">
          <div>
            <p className="text-black font-semibold">{title}</p>
            <p className="text-xs text-gray-600">{formattedDate}</p>
          </div>
          <div className="text-right text-xs text-gray-600">
            <p>Participants: 3</p>
            <p>Session duration: 1:00</p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex gap-4">
        <Button variant="secondary" className="bg-black text-white hover:bg-gray-800">
          Delete / Remove
        </Button>
        <Button 
          variant="outline"
          // onClick={() => startBoard(id)}
        >
          Start Board
        </Button>
      </CardFooter>
    </Card>
  )
}

export default RecordingCard
