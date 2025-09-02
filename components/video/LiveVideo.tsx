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


// export const HostControls = ({ hostIdentity }: HostControlsProps) => {
//   const room = useRoomContext()
//   const { localParticipant } = useLocalParticipant();
//   const participants = useParticipants();
//   const [isScreenSharing, setIsScreenSharing] = useState(false);

//    if (!localParticipant) return null

//   const isHost = localParticipant?.identity === hostIdentity;

//   const toggleMicrophone = async () => {
//     if (!localParticipant) return;
    
//     try {
//       await localParticipant.setMicrophoneEnabled(
//         !localParticipant.isMicrophoneEnabled
//       );
//     } catch (error) {
//       toast.error("Failed to toggle microphone");
//     }
//   };

//   const toggleCamera = async () => {
//     if (!localParticipant) return;
    
//     try {
//       await localParticipant.setCameraEnabled(
//         !localParticipant.isCameraEnabled
//       );
//     } catch (error) {
//       toast.error("Failed to toggle camera");
//     }
//   };

//   const toggleScreenShare = async () => {
//     // if (!localParticipant) return;

//     // try {
//     //   if (isScreenSharing) {
//     //     await localParticipant.setScreenShareEnabled(false);
//     //     setIsScreenSharing(false);
//     //   } else {
//     //     await localParticipant.setScreenShareEnabled(true);
//     //     setIsScreenSharing(true);
//     //   }
//     // } catch (error) {
//     //   toast.error("Failed to toggle screen share");
//     // }
//     try {
//       const next = !isScreenSharing
//       await localParticipant.setScreenShareEnabled(next)
//       setIsScreenSharing(next)
//     } catch (e) {
//       toast.error('Failed to toggle screen share')
//     }
//   };

//   const muteAllParticipants = async () => {
//    if (!isHost || !room) return
//     try {
//       const payload = new TextEncoder().encode(JSON.stringify({ type: 'MUTE_ALL' }))
//       await room.localParticipant.publishData(payload, { reliable: true })
//       toast.success('Requested all participants to mute')
//     } catch (e) {
//       toast.error('Failed to mute all participants')
//     }
//   };

//   return (
//     <div className="flex items-center gap-2 p-2 bg-secondary/50 rounded-b-lg">
//       <div className="flex items-center gap-2">
//         <Button
//           size="sm"
//           variant={localParticipant.isMicrophoneEnabled ? "default" : "destructive"}
//           onClick={toggleMicrophone}
//         >
//           {localParticipant.isMicrophoneEnabled ? (
//             <Mic className="h-4 w-4" />
//           ) : (
//             <MicOff className="h-4 w-4" />
//           )}
//         </Button>

//         <Button
//           size="sm"
//           variant={localParticipant.isCameraEnabled ? "default" : "destructive"}
//           onClick={toggleCamera}
//         >
//           {localParticipant.isCameraEnabled ? (
//             <Video className="h-4 w-4" />
//           ) : (
//             <VideoOff className="h-4 w-4" />
//           )}
//         </Button>

//         {isHost && (
//           <Button
//             size="sm"
//             variant={isScreenSharing ? "secondary" : "outline"}
//             onClick={toggleScreenShare}
//           >
//             {isScreenSharing ? (
//               <MonitorOff className="h-4 w-4" />
//             ) : (
//               <Monitor className="h-4 w-4" />
//             )}
//           </Button>
//         )}
//       </div>

//       {isHost && (
//         <div className="flex items-center gap-2">
//           <Button
//             size="sm"
//             variant="outline"
//             onClick={muteAllParticipants}
//             className="text-xs"
//           >
//             <VolumeX className="h-3 w-3 mr-1" />
//             Mute All
//           </Button>
//           <div className="flex items-center gap-1 text-xs text-muted-foreground">
//             <Users className="h-3 w-3" />
//             {participants.length}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };



























// "use client"
// import { Participant, Track } from 'livekit-client'
// import { useTracks } from "@livekit/components-react"
// import { useEffect, useRef, useState } from 'react'
// import { MicOff } from "lucide-react"


// interface VideoRendererProps {
//   participant: Participant
//   // displayName: string
//   isLocal: boolean
// }

// export const LiveVideo = ({
//   participant,
//   // displayName,
//   isLocal
// }: VideoRendererProps) => {
//   const videoRef = useRef<HTMLVideoElement>(null)
//   const audioRef = useRef<HTMLAudioElement>(null)
//   const [isVideoLoading, setIsVideoLoading] = useState(true)

//   // Get camera and microphone tracks
//   const cameraTrack = useTracks([Track.Source.Camera])
//     .find(t => t.participant.identity === participant.identity)
  
//   const micTrack = useTracks([Track.Source.Microphone])
//     .find(t => t.participant.identity === participant.identity)

//   useEffect(() => {
//     const videoEl = videoRef.current
//     const audioEl = audioRef.current

//     if (cameraTrack?.publication?.track && videoEl) {
//       cameraTrack.publication.track.attach(videoEl)
//       setIsVideoLoading(false)
//     }
//     if (micTrack?.publication?.track && audioEl) {
//       micTrack.publication.track.attach(audioEl)
//     }

//     return () => {
//       if (videoEl) videoEl.srcObject = null
//       if (audioEl) audioEl.srcObject = null
//     }
//   }, [cameraTrack, micTrack])

//   const hasVideo = cameraTrack?.publication?.isSubscribed
//   const isMicMuted = micTrack?.publication?.isMuted

//   return (
//     <div className="relative h-full w-full">
//       {isVideoLoading && (
//         <p>Loading...</p>
//       )}

//       {hasVideo ? (
//         <video
//           ref={videoRef}
//           className="absolute inset-0 h-full w-full object-cover"
//           autoPlay
//           playsInline
//           muted={isLocal}
//           onLoadedData={() => setIsVideoLoading(false)}
//         />
//       ) : (
//         <div className="absolute inset-0 flex items-center justify-center bg-muted">
//           <div className="text-center">
//             {/* <p className="font-medium">{displayName}</p> */}
//             <p className="text-sm text-muted-foreground">Camera is off</p>
//           </div>
//         </div>
//       )}

//       {/* Audio element (hidden) */}
//       <audio ref={audioRef} autoPlay playsInline />

//       {/* Bottom bar with name and mic status */}
//       <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
//         <div className="flex items-center gap-2">
//           {/* <span className="font-medium text-white truncate">
//             {displayName} {isLocal && "(You)"}
//           </span> */}
//           {isMicMuted && (
//             <div className="bg-rose-500 p-1 rounded-full">
//               <MicOff className="h-3 w-3 text-white" />
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   )
// }