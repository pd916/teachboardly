import React from 'react'
import { Navigation } from './Navigation'

const Sidebar = () => {
  return (
    <aside className="w-full sm:w-60 bg-[#4AAF6C] text-white min-h-screen fixed p-4">
      {/* <Toggle/> */}
      <Navigation/>
    </aside>
  )
}

export default Sidebar
