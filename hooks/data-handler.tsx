// DataHandler.tsx
import { useEffect } from 'react';
import { useLocalParticipant, useRoomContext } from '@livekit/components-react';
import { RoomEvent } from 'livekit-client';
import { toast } from 'sonner';

type ControlMessage =
  | { type: 'MUTE_ALL' }
  | { type: 'MUTE'; target: string }
  | { type: 'UNMUTE'; target: string };

export function DataHandler() {
  const room = useRoomContext();
  const { localParticipant } = useLocalParticipant();

  useEffect(() => {
    if (!room) return;

    const onData = async (payload: Uint8Array) => {
      if (!localParticipant) return;
      try {
        const msg = JSON.parse(new TextDecoder().decode(payload)) as ControlMessage;

        if (msg.type === 'MUTE_ALL') {
          if (localParticipant.isMicrophoneEnabled) {
            await localParticipant.setMicrophoneEnabled(false);
            toast.message('You have been muted by the host');
          }
        }

        if (msg.type === 'MUTE' && msg.target === localParticipant.identity) {
          if (localParticipant.isMicrophoneEnabled) {
            await localParticipant.setMicrophoneEnabled(false);
            toast.message('You have been muted by the host');
          }
        }

        if (msg.type === 'UNMUTE' && msg.target === localParticipant.identity) {
          // You cannot force unmute a user without user interaction; this is a request.
          toast.message('Host requested you to unmute');
          // Optionally: prompt UI for user to click unmute
        }
      } catch {
        // ignore malformed messages
      }
    };

    room.on(RoomEvent.DataReceived, onData);
    return () => {
      room.off(RoomEvent.DataReceived, onData);
    };
  }, [room, localParticipant]);

  return null;
}
