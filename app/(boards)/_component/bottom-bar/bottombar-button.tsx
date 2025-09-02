'use client'
import { Button } from '@/components/ui/button'
import { LucideIcon } from 'lucide-react';
import React from 'react'

type Props = {
    title?: string;
    icon: LucideIcon;
    variant?: 'ghost';
    label?: string;
    onClick: () => void;
}

const BottombarButton = ({
    title,
    icon:Icon,
    variant,
    label,
    onClick
}: Props) => {
  return <Button 
  size="sm"
  variant={variant}
  onClick={onClick}
  className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-300"
  aria-label={label}
  title={title}
  >
    <Icon className="w-5 h-5" />
  </Button>
}

export default BottombarButton