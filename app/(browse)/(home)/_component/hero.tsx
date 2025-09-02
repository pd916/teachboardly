"use client"

import React from 'react'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { ArrowRight, CheckCircle, Palette, Sparkles, Users, Video } from 'lucide-react'

const Hero = () => {
  const router = useRouter();
  const {data:session} = useSession();
  const isUser = session?.user;
  const link = isUser ? `/w/${session.user.name}` : "/sign-up"
  const handleRedirection = () => {
    router.push(link)
  }
  return (
       <main className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="relative max-w-6xl mx-auto text-center">
        <div className="relative z-10 md:space-y-0">
          {/* Main Heading */}
          <h1 className="text-3xl md:text-5xl lg:text-7xl font-black leading-tight">
  {/* TEACH LIVE */}
          <span className="relative inline-block">
            <span className="relative z-10">TEACH LIVE.</span>
            <span className="absolute inset-0 bg-yellow-300 blur-md opacity-60 rounded-lg -z-0"></span>
          </span>

          <br className="md:hidden" />

          {/* DRAW FREELY */}
          <span className="inline-block mx-2 md:mx-4">DRAW FREELY.</span>

          <br className="md:hidden" />

          {/* CONNECT INSTANTLY */}
          <span className="relative inline-block">
            <span className="relative z-10">CONNECT INSTANTLY.</span>
            <span className="absolute inset-0 bg-cyan-300 blur-md opacity-70 rounded-lg -z-0"></span>
          </span>
          </h1>


          {/* Hero Image */}
          <div className="relative w-full max-w-4xl mx-auto aspect-[16/7]">
            <Image
              src="/assets/hero.jpg" // place your image in public/hero.jpg
              alt="Hero"
              fill
              className="object-contain"
              priority
            />
          </div>

          {/* CTA Button */}
          <div className="pt-8 md:pt-0">
            <Button
              size="lg"
              className="bg-black hover:bg-gray-800 text-white px-8 py-3 md:px-12 md:py-4 text-sm md:text-base font-semibold rounded-full"
            >
              START FREE
            </Button>
          </div>
        </div>
      </div>
    </main>
  )
}

export default Hero