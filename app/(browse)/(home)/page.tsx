"use client"
import React from 'react'
import Hero from './_component/hero'
import ProblemSolution from './_component/problem-solution'
import { SolutionSection } from './_component/solution-section'
import { FeaturesSection } from './_component/Features'
import { TestimonialsSection } from './_component/testimonial-section'
import { CTASection } from './_component/cta'
import QuestionItem from './_component/question-item'

const Home = () => {

  return (
    <div className="p-2 border">
      <Hero/>
      <ProblemSolution/>
      <SolutionSection/>
      <FeaturesSection/>
      <TestimonialsSection/>
      {/* <QuestionItem/> */}
      <CTASection />
    </div>
  )
}

export default Home
