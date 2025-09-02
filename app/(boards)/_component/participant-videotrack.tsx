import { useTracks } from '@livekit/components-react'
import { Track, Participant } from 'livekit-client'
import { VideoTrack } from '@livekit/components-react'
import { User } from 'lucide-react'

export const ParticipantVideoTrack = ({ participant, className }: { participant: Participant; className?: string }) => {
  const tracks = useTracks([Track.Source.Camera, Track.Source.Microphone])
  const camTrack = tracks.find(
    (t) => t.participant.identity === participant.identity && t.source === Track.Source.Camera
  )

  if (!camTrack || !participant.isCameraEnabled) {
    return (
      <div className={`bg-muted flex items-center justify-center ${className}`}>
        <div className="text-center">
          <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-1">
            <User className="h-4 w-4 text-primary" />
          </div>
          <p className="text-xs text-muted-foreground">Camera Off</p>
        </div>
      </div>
    )
  }

  return <VideoTrack trackRef={camTrack} className={className} />
}
