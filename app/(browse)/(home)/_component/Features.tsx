import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Palette, Video, Users, FileText, Cloud, Shield, Smartphone, BarChart3, MessageSquare } from "lucide-react"

export function FeaturesSection() {
  const features = [
    {
      icon: Palette,
      title: "Interactive Whiteboard",
      description: "Advanced drawing tools, shapes, text, and real-time collaboration on an infinite canvas.",
      highlight: "Real-time sync",
    },
    {
      icon: Video,
      title: "HD Video Calls",
      description: "Crystal-clear video with screen sharing, recording, and up to 50 participants per session.",
      highlight: "4K quality",
    },
    {
      icon: Users,
      title: "Multi-User Collaboration",
      description: "Students can draw, annotate, and interact simultaneously with permission controls.",
      highlight: "Live cursors",
    },
    {
      icon: FileText,
      title: "Document Sharing",
      description: "Upload PDFs, images, and presentations directly to the whiteboard for annotation.",
      highlight: "Instant upload",
    },
    {
      icon: Cloud,
      title: "Cloud Storage",
      description: "Automatic session recording and file storage with unlimited cloud backup.",
      highlight: "Auto-save",
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "End-to-end encryption, GDPR compliance, and secure data handling for all sessions.",
      highlight: "Bank-grade security",
    },
    {
      icon: Smartphone,
      title: "Mobile Friendly",
      description: "Full functionality on tablets and smartphones with touch-optimized controls.",
      highlight: "Touch gestures",
    },
    {
      icon: BarChart3,
      title: "Analytics Dashboard",
      description: "Track student engagement, session duration, and learning progress with detailed insights.",
      highlight: "Real-time data",
    },
    {
      icon: MessageSquare,
      title: "Integrated Chat",
      description: "Text chat, emoji reactions, and file sharing without leaving the tutoring session.",
      highlight: "Live messaging",
    },
  ]

  return (
    <section id="features" className="py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl">Everything You Need to Teach Effectively</h2>
          <p className="mt-4 text-xl text-muted-foreground max-w-3xl mx-auto">
            Powerful features designed specifically for online educators to create engaging, interactive learning
            experiences that students love.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <Card key={index} className="relative overflow-hidden border-border hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-600">
                    <feature.icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                    <div className="inline-flex items-center rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                      {feature.highlight}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-muted-foreground">{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}