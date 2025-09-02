import { db } from "./db";


export const getBoardCountByUser = async (userId: string) => {
  const count = await db.board.count({
    where: { 
        userId:userId,
        isArchived:true
      },
  });

  return count;
};


