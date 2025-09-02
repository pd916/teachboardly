"use client"
import { useLocalParticipant } from "@livekit/components-react";
import { Track } from "livekit-client";
import { Mic, MicOff, Video, VideoOff } from "lucide-react";
import { Button } from "../ui/button";

export const MediaControls = () => {
  const { localParticipant } = useLocalParticipant();
  
  const toggleMic = async () => {
    if (localParticipant.isMicrophoneEnabled) {
      await localParticipant.setMicrophoneEnabled(false);
    } else {
      await localParticipant.setMicrophoneEnabled(true);
    }
  };

  const toggleCamera = async () => {
    if (localParticipant.isCameraEnabled) {
      await localParticipant.setCameraEnabled(false);
    } else {
      await localParticipant.setCameraEnabled(true);
    }
  };

  return (
    <div className="flex gap-2 bg-background/80 p-2 rounded-full">
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleMic}
        className="rounded-full p-2 h-8 w-8"
      >
        {localParticipant.isMicrophoneEnabled ? (
          <Mic className="h-4 w-4" />
        ) : (
          <MicOff className="h-4 w-4 text-rose-500" />
        )}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleCamera}
        className="rounded-full p-2 h-8 w-8"
      >
        {localParticipant.isCameraEnabled ? (
          <Video className="h-4 w-4" />
        ) : (
          <VideoOff className="h-4 w-4 text-rose-500" />
        )}
      </Button>
    </div>
  );
};