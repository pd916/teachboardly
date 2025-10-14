"use client"
import { deleteRecording } from '@/actions/recording'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { useRouter } from 'next/navigation'
import React from 'react'
import { toast } from 'sonner'

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
  createdAt,
}: RecordingCardProps) => {
  const router = useRouter()
    
  // Format the createdAt date nicely
  const formattedDate = new Date(createdAt).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })

    const handleDownload = async () => {
    try {
      let blob;
      
      // Check if videoUrl is a URL or base64
      if (videoUrl.startsWith('http') || videoUrl.startsWith('blob:')) {
        // It's a URL, fetch it
        const response = await fetch(videoUrl);
        if (!response.ok) throw new Error('Failed to fetch video');
        blob = await response.blob();
      } else {
        // It's base64 data
        let base64Data = videoUrl;
        
        // Remove data URL prefix if present
        if (base64Data.includes('base64,')) {
          base64Data = base64Data.split('base64,')[1];
        }
        
        // Remove any whitespace
        base64Data = base64Data.replace(/\s/g, '').trim();
        
        // Convert base64 to blob
        const binaryString = atob(base64Data);
        const bytes = new Uint8Array(binaryString.length);
        
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        
        blob = new Blob([bytes], { type: 'video/webm' });
      }
      
      // Ensure blob has correct type
      if (blob.type !== 'video/webm') {
        blob = new Blob([blob], { type: 'video/webm' });
      }
      
      // Create download link
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `recording-${title || id}-${formattedDate}.webm`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);
      }, 100);
      
      toast.success('Recording downloaded successfully');
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Failed to download recording');
    }
  };;

  const delRecording = async (id:string) => {
    await deleteRecording(id)
    toast.success('Recoding is Deleted')
    router.refresh()
  }


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
        <Button 
        variant="secondary" className="bg-black text-white hover:bg-gray-800"
        onClick={() => delRecording(id)}
        >
          Delete / Remove
        </Button>
          <Button 
          variant="outline"
          onClick={handleDownload}
          >
          Download Session
        </Button>
      </CardFooter>
    </Card>
  )
}

export default RecordingCard
