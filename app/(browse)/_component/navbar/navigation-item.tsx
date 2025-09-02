"use client"
import { cn } from '@/lib/utils';
import Link from 'next/link';
import React from 'react'

interface NavigationItemProps {
    label: string;
    href: string;
    isActive: boolean;
}

const NavigationItem = ({
    label,
    href,
    isActive
}:NavigationItemProps) => {
  return (
    <Link href={href}>
       <div className={cn(
         'flex items-center gap-x-4 hover:text-[#5de68b] transition ease-in-out',
         isActive && "font-extrabold"
        )}>
            <span>
                {label}
            </span>
       
    </div>
    </Link>
  )
}

export default NavigationItem
