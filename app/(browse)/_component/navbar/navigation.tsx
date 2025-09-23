"use client"
import { NavigationLinks } from '@/constant'
import React from 'react'
import NavigationItem from './navigation-item'
import { usePathname } from 'next/navigation'

const Navigation = () => {
  const pathname = usePathname()
  return (
    <div  className="
        flex 
        flex-col md:flex-row  
        items-start md:items-center
        gap-y-4 md:gap-y-0
        gap-x-0 md:gap-x-8
        ml-0 md:ml-4 lg:ml-0
      ">
      {NavigationLinks?.map((item) => (
        <NavigationItem
        key={item.id}
        label={item.label}
        href={item.href}
        isActive={item.href === pathname}
        />
      ))}
    </div>
  )
}

export default Navigation
