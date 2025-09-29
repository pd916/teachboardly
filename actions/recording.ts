"use server"

import { getSelf } from "@/lib/auth-service";
import cloudinary from "@/lib/cloudinary";
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

export const deleteRecording = async (id:string) => {
    try {
    // 1. Find the recording first
    const recording = await db.recording.findUnique({
      where: { id },
    })

    if (!recording) {
      throw new Error("Recording not found")
    }

    // 2. Delete from Cloudinary if we have a public_id
    if (recording.cloudinaryPublicId) {
      await cloudinary.uploader.destroy(recording.cloudinaryPublicId, {
        resource_type: "video",
      })
    }

    // 3. Delete from DB
    await db.recording.delete({
      where: { id },
    })

    return { success: true }
  } catch (error) {
    console.error("❌ Failed to delete recording:", error)
    return { success: false, error: "Could not delete recording" }
  }

}