"use client"
import { navElements } from '@/constant'
import { ActiveElement, BottombarProps } from '@/types/type'
import React, { memo } from 'react'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import ShapesMenu from './shapes-menu'
import Rightbar from './rightbar'
import Recording from '@/components/Recording'
import AddPages from './add-pages'

const BottomBar = ({
  activeElement, 
  canvaFabric,
  imageInputRef, 
  syncShapeInStorage,
  handleImageUpload, 
  handleActiveElement,
  elementAttributes,
  setElementAttributes,
  isEditingRef,
  activeObjectRef,
  canvasRef,
  isUser,
  userplan,
  boardId
}:BottombarProps) => {
  const isActive = (value: string | Array<ActiveElement>) => 
    (Array.isArray(value) && value.some((val) => val?.value === activeElement?.value))
  console.log(userplan, "comeeeee")
  
  return (
    <div className="bg-white lg:min-w-4xl lg:ml-20 rounded-lg 
    flex select-none border items-center lg:justify-between gap-4 px-2 md:overflow-x-auto w-full
    scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 whitespace-nowrap">

      <ul className="lg:flex flex-row inline-flex min-w-max">
        {navElements.map((item:ActiveElement | any) => (
          <li
          key={item.name}
          onClick={() => {
            if(Array.isArray(item.value)) return;
            handleActiveElement?.(item);
           }}
           className={`group px-2.5 py-3 flex justify-center items-center
            ${isActive(item?.value) && "bg-[#4AAF6C] text-white"}
            `}
          >
            {Array.isArray(item.value) ? (
              <ShapesMenu
               item={item}
               activeElement={activeElement}
               imageInputRef={imageInputRef}
               handleActiveElement={handleActiveElement}
               handleImageUpload={handleImageUpload}
               />
            ): (
               <Button variant="ghost" size="sm" className="relative w-6 h-6 p-2">
                <Image
                  src={item.icon}
                  alt={item.name}
                  fill
                  className={isActive(item.value) ? "invert" : ""}
                />
              </Button>
            ) }
          </li>
        ))}
      </ul>
        {/* <Separator orientation="vertical" className="h-10" /> */}
        <AddPages
        boardId={boardId}
        isUser={userplan}
        />  
      <Rightbar 
        elementAttributes={elementAttributes}
        setElementAttributes={setElementAttributes}
         fabricRef={canvaFabric}
         isEditingRef={isEditingRef}
         activeObjectRef={activeObjectRef}
         syncShapeInStorage={syncShapeInStorage}
         boardId={boardId}
      />
      {isUser && (
        <Recording 
        canvasRef={canvasRef}
        boardId={boardId}
        state={isUser.plan !== "PRO"}
        />
      )}
    </div>
  )
}

export default memo(BottomBar, (prevProps, nextProps) => prevProps.activeElement === nextProps.activeElement);
