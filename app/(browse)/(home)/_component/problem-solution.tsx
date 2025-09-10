import { AlertTriangle, Clock, MoveDownRight, MoveUpRight, Users, Zap } from 'lucide-react'
import React from 'react'

const ProblemSolution = () => {
  const problems = [
    {
      icon: AlertTriangle,
      title: "Limited Engagement",
      description:
        "Traditional video calls lack interactive elements, making it hard to keep students focused and engaged during lessons.",
    },
    {
      icon: Clock,
      title: "Time-Consuming Setup",
      description:
        "Switching between multiple tools for video, whiteboard, and file sharing wastes valuable teaching time.",
    },
    {
      icon: Users,
      title: "Poor Collaboration",
      description:
        "Students can't actively participate or collaborate in real-time, leading to passive learning experiences.",
    },
    {
      icon: Zap,
      title: "Technical Barriers",
      description:
        "Complex software and connectivity issues frustrate both tutors and students, disrupting the learning flow.",
    },
  ]
  return (
    <section className="py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">The Challenges of Online Tutoring</h2>
          <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
            Traditional online tutoring platforms fall short of creating engaging, interactive learning experiences that
            students need to succeed.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {problems.map((problem, index) => (
            <div key={index} className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-yellow-200">
                <problem.icon className="h-8 w-8 text-yellow-600" />
              </div>
              <h3 className="mt-6 text-lg font-semibold text-gray-900">{problem.title}</h3>
              <p className="mt-2 text-gray-600">{problem.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default ProblemSolution
