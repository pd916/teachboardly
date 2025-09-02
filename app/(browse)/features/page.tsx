import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Palette,
  Video,
  Users,
  FileText,
  Cloud,
  Shield,
  Smartphone,
  BarChart3,
  MessageSquare,
  Zap,
  Clock,
  Globe,
} from "lucide-react"

const features = [
  {
    icon: Palette,
    title: "Interactive Whiteboard",
    description:
      "Advanced drawing tools, shapes, text, and real-time collaboration on an infinite canvas with pressure-sensitive drawing.",
    highlight: "Real-time sync",
    category: "Core Tools",
  },
  {
    icon: Video,
    title: "HD Video Calls",
    description:
      "Crystal-clear video with screen sharing, recording, and up to 50 participants per session with adaptive quality.",
    highlight: "4K quality",
    category: "Communication",
  },
  {
    icon: Users,
    title: "Multi-User Collaboration",
    description:
      "Students can draw, annotate, and interact simultaneously with granular permission controls and live cursors.",
    highlight: "Live cursors",
    category: "Collaboration",
  },
  {
    icon: FileText,
    title: "Document Sharing",
    description:
      "Upload PDFs, images, presentations, and documents directly to the whiteboard for seamless annotation.",
    highlight: "Instant upload",
    category: "Content",
  },
  {
    icon: Cloud,
    title: "Cloud Storage",
    description: "Automatic session recording, unlimited file storage, and instant sync across all your devices.",
    highlight: "Auto-save",
    category: "Storage",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "End-to-end encryption, GDPR compliance, and bank-grade security for all your teaching sessions.",
    highlight: "Bank-grade security",
    category: "Security",
  },
  {
    icon: Smartphone,
    title: "Mobile Optimized",
    description: "Full functionality on tablets and smartphones with intuitive touch controls and gesture support.",
    highlight: "Touch gestures",
    category: "Accessibility",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description: "Track student engagement, session duration, and learning progress with comprehensive insights.",
    highlight: "Real-time data",
    category: "Analytics",
  },
  {
    icon: MessageSquare,
    title: "Integrated Chat",
    description: "Text chat, emoji reactions, file sharing, and voice notes without leaving the tutoring session.",
    highlight: "Live messaging",
    category: "Communication",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Sub-100ms latency for drawing and interactions, ensuring smooth real-time collaboration experience.",
    highlight: "< 100ms latency",
    category: "Performance",
  },
  {
    icon: Clock,
    title: "Session Recording",
    description: "Automatic session recording with searchable transcripts and timestamped annotations for review.",
    highlight: "Auto-transcribe",
    category: "Recording",
  },
  {
    icon: Globe,
    title: "Global CDN",
    description: "Worldwide content delivery network ensures fast loading times regardless of your location.",
    highlight: "99.9% uptime",
    category: "Infrastructure",
  },
]

export default function TeachingFeatures() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50">
      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {features.map((feature, index) => (
            <Card
              key={feature.title}
              className="group relative overflow-hidden border-0 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white/80 backdrop-blur-sm"
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg group-hover:shadow-emerald-200 transition-shadow">
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <Badge variant="secondary" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200">
                    {feature.category}
                  </Badge>
                </div>
                <CardTitle className="text-lg font-semibold text-gray-900 group-hover:text-emerald-700 transition-colors">
                  {feature.title}
                </CardTitle>
                <Badge variant="outline" className="w-fit text-xs border-emerald-200 text-emerald-600 bg-emerald-50">
                  {feature.highlight}
                </Badge>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 leading-relaxed">{feature.description}</CardDescription>
              </CardContent>

              {/* Hover effect overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </Card>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">Ready to Transform Your Teaching?</h2>
          <p className="mt-4 text-xl text-emerald-100">
            Join thousands of educators who are already creating amazing learning experiences.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="bg-white text-emerald-600 hover:bg-gray-50 px-8 py-3">
              Get Started Free
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white/10 px-8 py-3 bg-transparent"
            >
              Contact Sales
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
