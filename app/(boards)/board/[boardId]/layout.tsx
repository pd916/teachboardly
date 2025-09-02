import { db } from "@/lib/db";
import BoardSidebar from "../../_component/board-sidebar";
import { getSelf } from "@/lib/auth-service";
import { redirect } from "next/navigation";
import { getBoardCountByUser } from "@/lib/board-service";
import RightSidebar from "../../_component/right-sidebar";


interface CreatorLayoutProps {
  children: React.ReactNode
  params: Promise<{ boardId: string }>;
}

// const MAX_FREE_BOARDS = 2;
const CreatorLayout = async ({children, params}:CreatorLayoutProps) => {
     const { boardId } = await params;

    const board = await db.board.findUnique({
        where: {
          id: boardId
        },
       include: {
        user: true,
      },
      })
    
      if(!board) return;

       const self = await getSelf()
        
          // const isFreePlan = self?.plan === "FREE";
          // const boardCount = await getBoardCountByUser(self?.id!);
        
          // if (isFreePlan && boardCount > MAX_FREE_BOARDS) {
          //   redirect("/");
          // }

    return (
        <>
        <div className="flex h-full">
          {self && (
            <BoardSidebar
            board={board}
            />
          )}
             <main className="w-full border min-h-screen overflow-hidden">
            {children}
             </main>

             <div className="border w-72 shrink-0">
             <RightSidebar
             boardId={boardId}
             />
             </div>
        </div>
        </>
    )
}

export default CreatorLayout;