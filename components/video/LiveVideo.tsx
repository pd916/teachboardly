import { useState } from "react";
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Monitor, 
  MonitorOff,
  Volume2,
  VolumeX,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocalParticipant, useParticipants, useRoomContext } from "@livekit/components-react";
import { Track } from "livekit-client";
import { toast } from "sonner";

interface HostControlsProps {
  hostIdentity: string;
}

export const HostControls = ({ hostIdentity }: HostControlsProps) => {
  const room = useRoomContext();
  const { localParticipant } = useLocalParticipant();
  const participants = useParticipants();
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  if (!localParticipant) return null;

  const isHost = localParticipant.identity === hostIdentity;
  if (!isHost) return null; // <- hide everything for non-host viewers

  const toggleMicrophone = async () => {
    try {
      await localParticipant.setMicrophoneEnabled(!localParticipant.isMicrophoneEnabled);
    } catch {
      toast.error("Failed to toggle microphone");
    }
  };

  const toggleCamera = async () => {
    try {
      await localParticipant.setCameraEnabled(!localParticipant.isCameraEnabled);
    } catch {
      toast.error("Failed to toggle camera");
    }
  };

  const toggleScreenShare = async () => {
    try {
      const next = !isScreenSharing;
      await localParticipant.setScreenShareEnabled(next);
      setIsScreenSharing(next);
    } catch {
      toast.error("Failed to toggle screen share");
    }
  };

  const muteAllParticipants = async () => {
    try {
      const payload = new TextEncoder().encode(JSON.stringify({ type: "MUTE_ALL" }));
      await room.localParticipant.publishData(payload, { reliable: true });
      toast.success("Requested all participants to mute");
    } catch {
      toast.error("Failed to mute all participants");
    }
  };

  return (
    <div className="flex items-center gap-2 p-2 bg-secondary/50 rounded-b-lg">
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant={localParticipant.isMicrophoneEnabled ? "default" : "destructive"}
          onClick={toggleMicrophone}
        >
          {localParticipant.isMicrophoneEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
        </Button>

        <Button
          size="sm"
          variant={localParticipant.isCameraEnabled ? "default" : "destructive"}
          onClick={toggleCamera}
        >
          {localParticipant.isCameraEnabled ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
        </Button>

        <Button
          size="sm"
          variant={isScreenSharing ? "secondary" : "outline"}
          onClick={toggleScreenShare}
        >
          {isScreenSharing ? <MonitorOff className="h-4 w-4" /> : <Monitor className="h-4 w-4" />}
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Button size="sm" variant="outline" onClick={muteAllParticipants} className="text-xs">
          <VolumeX className="h-3 w-3 mr-1" />
          Mute All
        </Button>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Users className="h-3 w-3" />
          {participants.length}
        </div>
      </div>
    </div>
  );
};
