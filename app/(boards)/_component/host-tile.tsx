// HostTile.tsx
// import { Video } from '@/components/video/Video';
import { useParticipants, useLocalParticipant } from '@livekit/components-react'
import type { Participant } from 'livekit-client'
import { ParticipantVideoTrack } from './participant-videotrack';

export function HostTile({ hostIdentity, className }: { hostIdentity: string; className?: string }) {
  const participants = useParticipants()
  const { localParticipant } = useLocalParticipant()

  const host: Participant | undefined =
    participants.find(p => p.identity === hostIdentity) ??
    (localParticipant?.identity === hostIdentity ? (localParticipant as unknown as Participant) : undefined)
    

    console.log(host, "hostsss")

  return (
    <div className={`bg-black flex items-center justify-center relative ${className}`}>
      {host ? (
        <ParticipantVideoTrack participant={host} className="w-full h-full object-cover" />
      ) : (
        <p className="text-xs text-muted-foreground">Host video will appear here</p>
      )}
    </div>
  );
}



