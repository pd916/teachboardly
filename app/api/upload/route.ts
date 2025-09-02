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
    const { fileBase64, boardId } = body;
    console.log(fileBase64, boardId, "upload")
    if (!fileBase64 || !boardId) {
      return NextResponse.json({ error: 'Missing data' }, { status: 400 });
    }

    const self = await getSelf();
    if (!self) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const uploadResult = await cloudinary.uploader.upload(fileBase64, {
      folder: 'recordings',
      resource_type: 'auto',
    });

    const recording = await db.recording.create({
      data: {
        boardId,
        userId: self.id,
        videoUrl: uploadResult.secure_url,
        cloudinaryPublicId: uploadResult.public_id,
      },
    });

    // Delete from Cloudinary if needed
    // await cloudinary.uploader.destroy(uploadResult.public_id, { resource_type: 'video' });

    return NextResponse.json({ recording });
  } catch (error) {
    console.error('Upload failed:', error.stack);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
