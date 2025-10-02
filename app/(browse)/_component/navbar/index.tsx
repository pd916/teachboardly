import React from 'react'
import Logo from './logo'
import Navigation from './navigation'
import Actions from './actions'
import MobileNav from './mobile-nav'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface NavbarProps {
  isAdmin?: boolean
}

const Navbar = ({isAdmin}:NavbarProps) => {
  console.log(isAdmin, "admin")
  return (
    <nav className="fixed inset-y-0 top-0 w-full h-20 px-2 lg:px-4 flex justify-between 
    items-center shadow-sm bg-white z-20 overflow-hidden">
      <div className='hidden sm:block'>
      <Logo/>
      </div>
        <div className="hidden md:flex">
          <Navigation />
        </div>
        <MobileNav />
        <div className='flex gap-2'>
        {isAdmin && (
          <Link href={'/admin-panel'}>
          <Button>
            Admin Panel
          </Button>
          </Link>
        )}
      <Actions/>
        </div>
    </nav>
  )
}

export default Navbar
