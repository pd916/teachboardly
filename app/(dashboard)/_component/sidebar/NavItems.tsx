
"use client"
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import { LucideIcon } from 'lucide-react'
import Link from 'next/link';
import React from 'react'

interface NavItemsProps {
    icon: LucideIcon;
    label: string;
    isActive: boolean;
    href:string;

}

const NavItems = ({
     icon:Icon,
    label,
    isActive,
    href
}: NavItemsProps) => {
  return (
    <Button
    asChild
    variant="ghost"
    className={cn(
        "w-full h-12 justify-start",
        isActive && "bg-accent text-black" 
    )}
    >
    <Link href={href}>
    <div className='flex items-center gap-x-4'>
        <Icon className={cn(
            "h-4 w-4",
            // collapsed ? "mr-0" : "mr-2"
        )}/>
            <span>
                {label}
            </span>
    </div>
      </Link>
    </Button>
  )
}

export default NavItems

// collapsed ? "justify-center" : "justify-start",