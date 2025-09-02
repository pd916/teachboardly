"use client"
import { Hint } from '@/components/Hint';
import { Button } from '@/components/ui/button';
import { sidebarIcons } from '@/constant';
import { ModelType, useModelStore } from '@/hooks/use-model';
import { Board, User } from '@prisma/client';
import React from 'react'

interface ExtendedBoard extends Board {
  user: User;
}

interface BoardItemProps {
  board: ExtendedBoard;
}

const BoardSidebar = ({board}:BoardItemProps) => {
  console.log(board, "board")
    const {onOpen} = useModelStore((state) => state);
  return (
    <div className="w-18 border bg-white text-black min-h-screen z-10 fixed p-4">
      {sidebarIcons?.map((item) => (
        <div key={item.label} className='pt-4'>
       <Hint label={item.label} side='right' asChild>
                <Button
                variant="ghost"
                className='h-auto p-2'
                onClick={() => onOpen(item?.label as ModelType, {board})}
                >
                   {React.cloneElement(item.icon, { className: 'w-6 h-6' })}
                </Button>
            </Hint>
          </div>
      ))}
    </div>
  )
}

export default BoardSidebar;
