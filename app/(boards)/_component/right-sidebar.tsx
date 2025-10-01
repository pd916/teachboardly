"use client"
import { useViewerToken } from "@/hooks/use-viewer-token";
import {LiveKitRoom, RoomAudioRenderer, useLocalParticipant, useParticipants} from "@livekit/components-react";
import { useSession } from "next-auth/react";
import { Separator } from "@/components/ui/separator";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { ParticipantCard } from "@/components/video/participant-card";
import { DataHandler } from "@/hooks/data-handler";
import { HostTile } from "./host-tile";
import { HostControls } from "@/components/video/LiveVideo";
import { StartAudioOnInteract } from "./startAudio-intract";
import { useMemo } from "react";

interface RightSidebarProps {
  boardId: string | undefined;
}


const RightSidebar = ({boardId}:RightSidebarProps) => {
    const {data:session } = useSession();

    const { 
      token,
      name,
      identity,
      hostIdentity
    } = useViewerToken({boardId})

    // const hostIdentity = `host-${session?.user?.id}`
     if(!token || !name || !identity || !hostIdentity) {
        return <p>Something went worng</p>
    }


  return (
     <div
       className="w-full h-full bg-white shadow-lg rounded-xl border border-amber-400 overflow-hidden flex flex-col min-h-0">
        <div className="flex items-center justify-between px-4 py-2 border-b shrink-0">
        <h2 className="text-sm font-semibold">Video Call</h2>
      </div>

      <div className="relative flex-1 min-h-0 overflow-hidden">
            <LiveKitRoom
                token={token}
                // data-lk-theme="default"
                serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_WS_URL}
                connect={true}
                audio={true}
                video={true}
                options={{
                audioCaptureDefaults: {
                  echoCancellation: true,
                  noiseSuppression: true,
                  autoGainControl: true,
                },
              }}
                className="relative h-full w-full flex flex-col min-h-0"
            >
                  <div className="border-b p-2 shrink-0">
                    <RoomAudioRenderer />
                    <StartAudioOnInteract />
                    <DataHandler />

                    <div className="border-b">
                    <HostTile 
                    hostIdentity={hostIdentity} 
                    className="h-40 w-full border border-amber-400 rounded" />
                    <HostControls hostIdentity={hostIdentity} /> {/* host tools under host tile */}
                  </div>

                 {/* <Video
                //  hostIdentity={`host-${session?.user?.id}`}
                hostIdentity={hostIdentity}
                 className="h-40 w-full border border-amber-400"
                 /> */}
                 </div>

                 <Separator />
                <div className="flex-1 min-h-0 overflow-y-auto">
                <ParticipantsSection 
                // hostIdentity={`${session?.user?.id}`} 
                hostIdentity={hostIdentity}
                />
            </div>
                

            </LiveKitRoom>
            </div>
     </div>
  )
}

export default RightSidebar;
{/* <MediaControls /> */}

interface ParticipantsSectionProps {
  hostIdentity: string;
  excludeSelf?: boolean;
}

const ParticipantsSection = ({ 
  hostIdentity,
   excludeSelf = false, 
  }: ParticipantsSectionProps) => {
  const participants = useParticipants();
  const { localParticipant } = useLocalParticipant();

   const list = useMemo(() => {
    return participants
      .filter((p) => p.identity !== hostIdentity)
      .filter((p) => (excludeSelf ? p.identity !== localParticipant?.identity : true))
      .sort((a, b) => {
        const an = (a.name || a.identity).toLowerCase();
        const bn = (b.name || b.identity).toLowerCase();
        return an.localeCompare(bn);
      });
  }, [participants, hostIdentity, excludeSelf, localParticipant?.identity]);
  


  return (
    <div className="h-full flex flex-col min-h-0">
      <div className="px-3 py-2 bg-muted/30 shrink-0">
        <h3 className="text-xs font-medium text-muted-foreground">
          Participants ({list.length})
        </h3>
      </div>
      
      <ScrollArea className="flex-1 min-h-0">
        <div className="space-y-2 py-2 px-3">
          {list.length === 0 ? (
            <div className="flex items-center justify-center h-20 text-muted-foreground">
              <p className="text-xs">No other participants</p>
            </div>
          ) : (
            list.map((participant) => (
              <ParticipantCard
                key={participant.sid}
                participant={participant}
                hostIdentity={hostIdentity}
              />
            ))
          )}
        </div>
        <ScrollBar orientation="vertical"/> 
      </ScrollArea>
    </div>
  );
};