import React, { ReactNode } from 'react'

interface FloatingIconProps {
   icon?: string; 
  position: string;
  label?: string;
}
const FlatIcons = ({
    icon,
    position,
    label,
}:FloatingIconProps) => {
  if(label){
    return <div className={`absolute ${position} z-10`}>
      <h1 className='text-sm sm:text-3xl font-bold sm:w-12 sm:h-12 lg:w-full lg:h-14'>{label}</h1>
    </div>
  }
  return (
     <div className={`absolute ${position} z-10`}>
      <img src={icon} alt="floating-icon" />
    </div>
  )
}

export default FlatIcons
