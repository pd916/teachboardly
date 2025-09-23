"use client"

import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Menu } from "lucide-react"
import Navigation from "./navigation"
import Logo from "./logo"
import { useState } from "react"

const MobileNav = () => {
    
  return (
    <div className="md:hidden">
      <Sheet>
        <SheetTrigger asChild>
          <button className="p-2 rounded-md hover:bg-gray-100">
            <Menu className="h-6 w-6" />
          </button>
        </SheetTrigger>
        
        <SheetContent side="left" className="p-4">
             <SheetTitle className="sr-only">Mobile Navigation Menu</SheetTitle>
            <div>
            <Logo /> 
        </div>
          <Navigation />
        </SheetContent>
      </Sheet>
    </div>
  )
}

export default MobileNav
