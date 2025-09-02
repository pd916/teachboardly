"use client";

import { useSocket } from "@/components/provider/socket-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useGuestStore } from "@/hooks/use-guest-store";
// import { User } from "@prisma/client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import NoSavedBoardSVG from "./no-board";
// import { BarChart3, Users, VideoIcon } from "lucide-react";

// type Guest = {
//   id: string;
//   name:string;
//   boardId: string;
// }

interface SessionBoardCardProps {
  id:string;
  title:string;
}

export const SessionBoardCard = ({
  id,
  title,
}:SessionBoardCardProps) => {
  const router = useRouter();
  const {setCurrentGuest} = useGuestStore((state) => state);
  const {data:session} = useSession();

  const startBoard = useCallback ((id:string) => {
    if(!session?.user) return;

    const guest = {
      id:session?.user?.id,
      name:session?.user?.name
    }

    setCurrentGuest(guest)

  router.push(`/board/${id}`); // redirect after we are added
  },[session, setCurrentGuest, router])

  return (
     <Card className="w-full max-w-sm rounded-xl bg-gray-100">
      <CardContent className="p-4">
        <div className="h-32 bg-white rounded-md mb-4" />
        <div className="flex justify-between text-sm font-medium">
          <div>
            <p className="text-black">{title}</p>
            <p className="text-xs text-gray-600">28-6-2025</p>
          </div>
          <div className="text-right text-xs text-gray-600">
            <p>Participants: 3</p>
            <p>Session duration: 1:00</p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex gap-4">
        <Button variant="secondary" className="bg-black text-white hover:bg-gray-800">
          Delete / Remove
        </Button>
        <Button 
        variant="outline"
        onClick={() => startBoard(id)}
        >
          Start Board
        </Button>
      </CardFooter>
    </Card>
  );
};
