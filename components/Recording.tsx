"use client"
import React, { useEffect, useRef, useState, useTransition } from 'react'
import { Button } from './ui/button'
import { CircleDot } from 'lucide-react'
import { toast } from 'sonner';

type RecordingProps = {
  canvasRef: React.RefObject<HTMLDivElement | null>;
  boardId?: string | string[] | undefined;
  isDisabled: boolean;
};

interface ScreenCaptureConstraints extends MediaTrackConstraints {
  mediaSource?: string;
}

const Recording = ({canvasRef, boardId, isDisabled}: RecordingProps) => {
    const [recording, setRecording] = useState(false);
    const [isPending, startTransition] = useTransition();
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
    alert(isDisabled)

  const startRecording = async () => {
    try {
      // Use screen sharing to record the entire page
        const displayStream = await navigator.mediaDevices.getDisplayMedia({
      video: {
        mediaSource: 'screen', // Firefox only
        width: { ideal: 1920 },
        height: { ideal: 1080 },
        frameRate: { ideal: 30 }
      } as ScreenCaptureConstraints,
      audio: true
    });

      // Also get microphone audio
      let micStream;
      try {
        micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch (micError) {
        console.log("Microphone access denied, continuing with screen audio only");
      }

      // Combine streams if microphone is available
      let finalStream = displayStream;
      if (micStream) {
        const audioTracks = [
          ...displayStream.getAudioTracks(),
          ...micStream.getAudioTracks()
        ];
        
        finalStream = new MediaStream([
          ...displayStream.getVideoTracks(),
          ...audioTracks
        ]);
      }

      const recorder = new MediaRecorder(finalStream, {
        mimeType: 'video/webm;codecs=vp9'
      });

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: "video/webm" });
        chunksRef.current = [];

        
        startTransition(() => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64String = reader.result;

            fetch('/api/upload', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                fileBase64: base64String,
                boardId,
              }),
            })
            .then(res => res.json())
            .then(data => {
              console.log("Upload success:", data);
              toast.success("Recording saved successfully");
            })
            .catch(error => {
              console.error("Upload error:", error);
              toast.error("Failed to save recording");
            });
          };

          reader.readAsDataURL(blob);
        });
      };

      // Handle when user stops screen sharing manually
      displayStream.getVideoTracks()[0].addEventListener('ended', () => {
        stopRecording();
      });

       recordingTimerRef.current = setTimeout(() => {
        stopRecording();
        toast.info("Recording automatically stopped after 10 minutes");
      }, 
      600000
    );

      recorder.start(1000); // Collect data every second
      mediaRecorderRef.current = recorder;
      setRecording(true);
      toast.success("Screen recording started - select your browser tab");
      
    } catch (error) {
      console.error("Error starting recording:", error);
      toast.error("Screen recording not supported or permission denied");
    }
  };

  const stopRecording = () => {

    if (recordingTimerRef.current) {
      clearTimeout(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }

    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      
      // Stop all tracks
      const stream = mediaRecorderRef.current.stream;
      stream.getTracks().forEach((track) => track.stop());
      
      mediaRecorderRef.current = null;
    }
    setRecording(false);
    toast.success("Recording stopped");
  };

  const toggleRecording = () => {
    if (recording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) {
        clearTimeout(recordingTimerRef.current);
      }
    };
  }, []);

  return (
    <Button 
      variant="outline" 
      disabled={isDisabled}
      size="sm" 
      aria-label={recording ? "Stop recording" : "Start screen recording"}
      onClick={toggleRecording}
    >
      <CircleDot className={`h-6 w-6 ${
        recording 
          ? "text-red-500 animate-pulse" 
          : isPending 
          ? "text-yellow-500" 
          : ""
      }`} />
      {isPending && <span className="ml-1 text-xs">Saving...</span>}
    </Button>
  )
}

export default Recording