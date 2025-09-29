import { NextRequest, NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';
import { db } from '@/lib/db';
import { getSelf } from '@/lib/auth-service';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '100mb',
    },
  },
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    let { fileBase64, boardId } = body;

    if (!fileBase64 || !boardId) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    const self = await getSelf();
    if (!self) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // ✅ If it's already a Data URI, keep it. Otherwise, wrap it properly.
    let uploadSource: string;
    if (fileBase64.startsWith("data:")) {
      uploadSource = fileBase64;
    } else {
      uploadSource = `data:video/webm;base64,${fileBase64}`;
    }

    const uploadResult = await cloudinary.uploader.upload(uploadSource, {
      folder: "recordings",
      resource_type: "video", // 👈 force video type
    });

    const recording = await db.recording.create({
      data: {
        boardId,
        userId: self.id,
        videoUrl: uploadResult.secure_url,
        cloudinaryPublicId: uploadResult.public_id,
      },
    });

    return NextResponse.json({ recording });
  } catch (error: any) {
    console.error("❌ Upload failed:", error.message || error.stack);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
