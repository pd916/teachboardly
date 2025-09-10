import React from 'react'
import Logo from './logo'
import Navigation from './navigation'
import Actions from './actions'

const Navbar = () => {
  return (
    <nav className="fixed inset-y-0 top-0 w-full h-20 px-2 lg:px-4 flex justify-between 
    items-center shadow-sm bg-white z-20 overflow-hidden">
      <Logo/>
      <Navigation/>
      <Actions/>
    </nav>
  )
}

export default Navbar
