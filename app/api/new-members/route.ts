import { getSelf } from "@/lib/auth-service";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const self = await getSelf();
  if (!self) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const boardId = searchParams.get("boardId");

  if (!boardId) {
    return NextResponse.json({ error: "Missing boardId" }, { status: 400 });
  }

  // const isMember = await db.member.findFirst({
  //   where: {
  //     boardId,
  //     userId: self.id,
  //     isKicked: false,
  //   },
  // });

  // if (!isMember) {
  //  return NextResponse.json([]);
  // }

  const members = await db.member.findMany({
    where: {
      boardId,
      isKicked: false,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          imageUrl: true,
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  return NextResponse.json(members);
}
