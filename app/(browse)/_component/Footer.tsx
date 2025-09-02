import { Facebook, Instagram, Linkedin } from 'lucide-react'
import React from 'react'

const Data = [
  {
    id: 1,
    icon: <Instagram/>
  },
  {
    id: 2,
    icon: <Linkedin/>
  },
  {
    id: 3,
    icon: <Facebook/>
  },
]

const Footer = () => {
  return (
    <footer className='bg-black top-0 w-full h-40
        px-2 lg:px-4 flex justify-center gap-2 items-center shadow-sm'>
      {Data.map((item:any) => (
        <div key={item.id} className='rounded-full border p-2 text-white'>
          {item.icon}
        </div>
      ))}
    </footer>
  )
}

export default Footer
