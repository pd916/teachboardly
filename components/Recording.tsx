"use client"
import React, { useRef, useState, useTransition } from 'react'
import { Button } from './ui/button'
import { CircleDot } from 'lucide-react'
import { recordings } from '@/actions/recording';
import { toast } from 'sonner';

type RecordingProps = {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  boardId?: string | string[] | undefined;
  state: boolean;
};

const Recording = ({canvasRef, boardId, state}:RecordingProps) => {
    const [recording, setRecording] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    if (!canvasRef.current) {
      return;
    }

    try {
         const canvasStream = canvasRef.current.captureStream(30);
         const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });

         const combinedStream = new MediaStream([
        ...canvasStream.getVideoTracks(),
        ...audioStream.getAudioTracks(),
      ]);

      const recorder = new MediaRecorder(combinedStream);

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: "video/webm" });
        chunksRef.current = [];

        setVideoBlob(blob); // 👈 Save to state
        console.log("📹 Recording blob created:", blob)
        // Save blob to DB here:
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
        toast.success("Recording saved Successfully")
      })
      .catch(error => {
        console.error("Upload error:", error);
      });
  };

  reader.readAsDataURL(blob); // Converts to base64
});

      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setRecording(true);
    } catch (error) {
     console.error("Error starting recording:", error);   
    }
  }


  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop());
      mediaRecorderRef.current = null;
    }
    setRecording(false);
  };

  const toggleRecording = () => {
    if (recording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <Button 
    variant="outline" 
    disabled={state}
    size="sm" 
    aria-label={recording ? "Stop recording" : "Start recording"}
    onClick={toggleRecording}>
      <CircleDot  className={`h-6 w-6 ${recording ? "text-red-500 animate-pulse" : ""}`}/>
    </Button>
  )
}

export default Recording
