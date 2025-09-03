"use srever"

import { getSelf } from "@/lib/auth-service";
import { db } from "@/lib/db";
import fs from "fs";
import path from "path";

export const recordings = async (formData:any) => {
  const self = await getSelf();
  if (!self) {
    throw new Error("User not found");
  }
    const file = formData.get('file') as Blob | null;
  const boardId = formData.get('boardId') as string | null;

  if (!file || !boardId) {
    throw new Error("Missing file or boardId");
  }

  const arrayBuffer = await file.arrayBuffer();

  const buffer = Buffer.from(arrayBuffer);
  const base64Data = buffer.toString("base64");


  const recording = await db.recording.create({
    data: {
      boardId,
      videoUrl: base64Data, // public URL path
      userId:self?.id,
    },
  });

  return recording

}