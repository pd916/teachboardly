import Image from 'next/image'
import React from 'react'

const Logo = () => {
  return (
    <div className='overflow-hidden'>
      <div className='relative w-30 h-30'>
      <Image src="/assets/home.png" alt='home' fill/>
      </div>
    </div>
  )
}

export default Logo
