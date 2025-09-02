import { CheckCircle, Palette, Video, Users, Zap } from "lucide-react"

export function SolutionSection() {
  const solutions = [
    {
      icon: Palette,
      title: "Interactive Whiteboard",
      description:
        "Draw, annotate, and collaborate in real-time with advanced whiteboard tools that make learning visual and engaging.",
    },
    {
      icon: Video,
      title: "HD Video Calls",
      description:
        "Crystal-clear video communication with screen sharing, recording, and multi-participant support for group sessions.",
    },
    {
      icon: Users,
      title: "Real-Time Collaboration",
      description: "Students can actively participate, share ideas, and work together on problems simultaneously.",
    },
    {
      icon: Zap,
      title: "One-Click Setup",
      description:
        "Start teaching instantly with our streamlined platform that combines all essential tools in one place.",
    },
  ]

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">The Complete Solution for Modern Tutoring</h2>
            <p className="mt-4 text-xl text-gray-600">
              TutorLive combines everything you need for effective online teaching in one powerful, easy-to-use platform
              designed specifically for educators.
            </p>

            <div className="mt-8 space-y-6">
              {solutions.map((solution, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-4 cursor-pointer"
                >
                  <div className="flex-shrink-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-100 group-hover:bg-emerald-200 transition-colors duration-300">
                      <solution.icon className="h-6 w-6 text-emerald-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{solution.title}</h3>
                    <p className="mt-1 text-gray-600">{solution.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-emerald-500" />
              <span className="text-gray-600">Trusted by 10,000+ educators worldwide</span>
            </div>
          </div>

          <div className="mt-12 lg:mt-0">
            <div className="relative group">
              <img
                className="w-full rounded-lg shadow-xl"
                src="/assets/solution.jpg"
                alt="solution"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/20 to-transparent rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
