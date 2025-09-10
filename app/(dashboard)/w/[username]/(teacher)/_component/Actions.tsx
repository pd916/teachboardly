"use client"
import { Button } from '@/components/ui/button'
import { useModelStore } from '@/hooks/use-model'
import { Plus } from 'lucide-react';

const Actions = () => {
  const {onOpen} = useModelStore((state) => state);
  return (
     <div className="w-full flex justify-end px-2">
      <Button
       onClick={() => onOpen("createBoard")}
       variant="outline" 
       className="text-black">
        <Plus/>
        Create Whiteboard
      </Button>
    </div>
  )
}

export default Actions
