"use client"
import { useRemoteParticipant, useLocalParticipant, useParticipants, useTracks, VideoTrack } from "@livekit/components-react"
import { cn } from "@/lib/utils"
import { HostControls} from "./LiveVideo"
// import { MediaControls } from "./MediaControll"
import { Track } from "livekit-client"
import { VideoOff } from "lucide-react"


interface TeacherVideoProps {
  hostIdentity: string
  className?: string
}

export const Video = ({
  hostIdentity,
  className
}: TeacherVideoProps) => {
  const { localParticipant } = useLocalParticipant()
 

 if (!localParticipant) {
    return (
      <div className={`bg-muted rounded-lg flex items-center justify-center ${className}`}>
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
     <div className="bg-card rounded-lg overflow-hidden border border-primary/20">
      <div className="relative">
        <HostVideoTrack className={`rounded-t-lg bg-muted ${className}`} />
        <div className="absolute top-2 left-2 px-2 py-1 bg-primary/80 text-primary-foreground text-xs rounded">
          Host
        </div>
        <div className="absolute top-2 right-2 px-2 py-1 bg-black/50 text-white text-xs rounded">
          {localParticipant.name || localParticipant.identity}
        </div>
      </div>
      <HostControls hostIdentity={hostIdentity} />
    </div>
  )
}


const HostVideoTrack = ({ className }: { className?: string }) => {
  const tracks = useTracks([Track.Source.Camera]);
  const localTrack = tracks.find(track => track.participant.isLocal);

  if (!localTrack) {
    return (
      <div className={`bg-muted flex items-center justify-center ${className}`}>
        <div className="text-center">
          <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-2">
            <VideoOff className="h-6 w-6 text-primary" />
          </div>
          <p className="text-xs text-muted-foreground">Camera Off</p>
        </div>
      </div>
    );
  }

  return (
    <VideoTrack
      trackRef={localTrack}
      className={className}
    />
  );
};