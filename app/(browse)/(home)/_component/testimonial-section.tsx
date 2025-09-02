import { Card, CardContent } from "@/components/ui/card"
import { Star } from "lucide-react"

export function TestimonialsSection() {
  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Math Tutor",
      avatar: "/placeholder-funy2.png",
      content:
        "TutorLive has completely transformed how I teach online. The interactive whiteboard makes complex math problems so much easier to explain, and my students are more engaged than ever.",
      rating: 5,
    },
    {
      name: "Michael Rodriguez",
      role: "Language Teacher",
      avatar: "/professional-male-teacher-headshot.png",
      content:
        "The real-time collaboration features are incredible. My students can practice writing together, and I can provide instant feedback. It's like having a physical classroom online.",
      rating: 5,
    },
    {
      name: "Dr. Emily Watson",
      role: "Science Professor",
      avatar: "/placeholder-k806s.png",
      content:
        "I've tried many platforms, but TutorLive is the only one that truly supports interactive science lessons. The ability to draw diagrams and share documents seamlessly is game-changing.",
      rating: 5,
    },
    {
      name: "James Park",
      role: "Programming Instructor",
      avatar: "/male-programming-instructor-headshot.png",
      content:
        "Teaching code online was always challenging until I found TutorLive. The screen sharing and collaborative coding features make it feel like we're sitting side by side.",
      rating: 5,
    },
    {
      name: "Lisa Thompson",
      role: "Art Teacher",
      avatar: "/female-art-teacher-headshot.png",
      content:
        "As an art teacher, I need visual tools that work flawlessly. TutorLive's drawing capabilities and color options let me demonstrate techniques in real-time with perfect clarity.",
      rating: 5,
    },
    {
      name: "David Kumar",
      role: "Business Coach",
      avatar: "/professional-male-business-coach-headshot.png",
      content:
        "The analytics dashboard helps me track my students' progress and engagement. I can see exactly where they need more support and adjust my teaching accordingly.",
      rating: 5,
    },
  ]

  return (
    <section id="testimonials" className="py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl">Loved by Educators Worldwide</h2>
          <p className="mt-4 text-xl text-muted-foreground max-w-3xl mx-auto">
            Join thousands of tutors and teachers who have transformed their online teaching experience with TutorLive.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="border-border">
              <CardContent className="p-6">
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-6 leading-relaxed">"{testimonial.content}"</p>
                <div className="flex items-center space-x-3">
                  <img
                    className="h-12 w-12 rounded-full object-cover"
                    src={testimonial.avatar || "/placeholder.svg"}
                    alt={testimonial.name}
                  />
                  <div>
                    <p className="font-semibold text-foreground">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}