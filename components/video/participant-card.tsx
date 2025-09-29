import { useState } from "react";
import { VideoTrack, useLocalParticipant, useRoomContext, useTracks } from "@livekit/components-react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Video, VideoOff, VolumeX, User } from "lucide-react";
import { Participant, Track } from "livekit-client";
import { toast } from "sonner";

interface ParticipantCardProps {
 participant: Participant;
  hostIdentity: string;
}

const ParticipantVideoTrack = ({ participant, className }: { participant: Participant; className?: string }) => {
  const tracks = useTracks([Track.Source.Camera, 
    Track.Source.Microphone]);

  const participantTrack = tracks.find(track => 
    track.participant.identity === participant.identity && 
      track.source === Track.Source.Camera);


  if (!participantTrack || !participant.isCameraEnabled) {
    return (
      <div className={`bg-muted flex items-center justify-center w-full h-full object-cover ${className}`}>
        <div className="text-center">
          <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-1">
            <User className="h-4 w-4 text-primary" />
          </div>
          <p className="text-xs text-muted-foreground">Camera Off</p>
        </div>
      </div>
    );
  }

  return <VideoTrack
      trackRef={participantTrack}
      className={`w-full h-full object-cover ${className}`}
    />
};

export const ParticipantCard = ({ participant, hostIdentity }: ParticipantCardProps) => {
  const room = useRoomContext();
  const { localParticipant } = useLocalParticipant();

  const amIHost = localParticipant?.identity === hostIdentity;               // local user is host?
  const isSelf = localParticipant?.identity === participant.identity;        // this card is me?
  const isHostParticipant = participant.identity === hostIdentity;           // this card is the host?

  // If this card is the host (and I'm not the host viewing myself), render video only.
  if (isHostParticipant && !isSelf) {
    return (
      <div className="bg-card rounded-lg overflow-hidden border">
        <div className="relative">
          <ParticipantVideoTrack
            participant={participant}
            className="aspect-video h-24 bg-muted"
          />
          <div className="absolute top-1 right-1 px-1 py-0.5 bg-black/50 text-white text-xs rounded">
            {participant.name || participant.identity}
          </div>
        </div>
      </div>
    );
  }

  const muteParticipant = async () => {
    if (!amIHost || !room || isSelf || isHostParticipant) return;
    try {
      const payload = new TextEncoder().encode(JSON.stringify({ type: 'MUTE', target: participant.identity }));
      await room.localParticipant.publishData(payload, { reliable: true });
      toast.success(`Muted ${participant.name || participant.identity}`);
    } catch {
      toast.error('Failed to mute participant');
    }
  };

  const unmuteParticipant = async () => {
    if (!amIHost || !room || isSelf || isHostParticipant) return;
    try {
      const payload = new TextEncoder().encode(JSON.stringify({ type: 'UNMUTE', target: participant.identity }));
      await room.localParticipant.publishData(payload, { reliable: true });
      toast.success(`Requested unmute for ${participant.name || participant.identity}`);
    } catch {
      toast.error('Failed to request unmute');
    }
  };

  const toggleOwnMicrophone = async () => {
    if (!isSelf || !localParticipant) return;
    try {
      await localParticipant.setMicrophoneEnabled(!localParticipant.isMicrophoneEnabled);
    } catch {
      toast.error('Failed to toggle microphone');
    }
  };

  const toggleOwnCamera = async () => {
    if (!isSelf || !localParticipant) return;
    try {
      await localParticipant.setCameraEnabled(!localParticipant.isCameraEnabled);
    } catch {
      toast.error('Failed to toggle camera');
    }
  };

  return (
    <div className="bg-card rounded-lg overflow-hidden border border-purple-500">
      <div className="relative w-full border border-red-600">
        <ParticipantVideoTrack
          participant={participant}
          className="aspect-video w-full bg-muted object-cover"
        />
        <div className="absolute top-1 right-1 px-1 py-0.5 bg-black/50 text-white text-xs rounded">
          {participant.name || participant.identity}
        </div>
      </div>

      {!(isHostParticipant && !isSelf) && (
      <div className="p-2 flex items-center justify-between">
        {isSelf ? (
          <>
            <Button
              size="sm"
              variant={participant.isMicrophoneEnabled ? "default" : "destructive"}
              onClick={toggleOwnMicrophone}
              className="h-6 w-6 p-0"
            >
              {participant.isMicrophoneEnabled ? <Mic className="h-3 w-3" /> : <MicOff className="h-3 w-3" />}
            </Button>
            <Button
              size="sm"
              variant={participant.isCameraEnabled ? "default" : "destructive"}
              onClick={toggleOwnCamera}
              className="h-6 w-6 p-0"
            >
              {participant.isCameraEnabled ? <Video className="h-3 w-3" /> : <VideoOff className="h-3 w-3" />}
            </Button>
          </>
        ) : (
          // Only show status dots for non-self, non-host participants
          !isHostParticipant && (
            <div className="flex items-center gap-1">
              <div className={`h-2 w-2 rounded-full ${participant.isMicrophoneEnabled ? 'bg-green-500' : 'bg-red-500'}`} />
              <div className={`h-2 w-2 rounded-full ${participant.isCameraEnabled ? 'bg-green-500' : 'bg-red-500'}`} />
            </div>
          )
        )}

        {/* Host controls visible only to the host, never on self or host tile */}
        {amIHost && !isSelf && !isHostParticipant && (
          <>
            <Button size="sm" variant="outline" onClick={muteParticipant} className="h-6 px-2">
              <VolumeX className="h-3 w-3 mr-1" /> Mute
            </Button>
            <Button size="sm" variant="outline" onClick={unmuteParticipant} className="h-6 px-2">
              Unmute
            </Button>
          </>
        )}
      </div>
      )}
    </div>
  );
};


