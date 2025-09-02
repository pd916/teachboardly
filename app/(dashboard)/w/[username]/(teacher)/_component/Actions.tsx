"use client"
import { Button } from '@/components/ui/button'
import { useModelStore } from '@/hooks/use-model'

const Actions = () => {
  const {onOpen} = useModelStore((state) => state);
  return (
     <div className="w-full flex justify-end px-2">
      <Button
       onClick={() => onOpen("createBoard")}
       variant="primary" className="text-white">
        Create Whiteboard
      </Button>
    </div>
  )
}

export default Actions
