import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, Star } from "lucide-react"

export function PricingSection() {
  const plans = [
    {
      name: "Starter",
      price: "$19",
      period: "per month",
      description: "Perfect for individual tutors getting started",
      features: [
        "Up to 10 students per session",
        "Interactive whiteboard",
        "HD video calls",
        "Basic recording (2 hours/month)",
        "Cloud storage (5GB)",
        "Email support",
      ],
      cta: "Start Free Trial",
      popular: false,
    },
    {
      name: "Professional",
      price: "$49",
      period: "per month",
      description: "Ideal for established tutors and small institutions",
      features: [
        "Up to 25 students per session",
        "Advanced whiteboard tools",
        "4K video calls",
        "Unlimited recording",
        "Cloud storage (50GB)",
        "Analytics dashboard",
        "Priority support",
        "Custom branding",
      ],
      cta: "Start Free Trial",
      popular: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "pricing",
      description: "For large institutions and organizations",
      features: [
        "Unlimited students per session",
        "Full feature access",
        "White-label solution",
        "Unlimited storage",
        "Advanced analytics",
        "API access",
        "Dedicated support",
        "Custom integrations",
        "SLA guarantee",
      ],
      cta: "Contact Sales",
      popular: false,
    },
  ]

  return (
    <section id="pricing" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl">Simple, Transparent Pricing</h2>
          <p className="mt-4 text-xl text-muted-foreground max-w-3xl mx-auto">
            Choose the plan that fits your needs. All plans include a 14-day free trial with no credit card required.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-3">
          {plans.map((plan, index) => (
            <Card key={index} className={`relative border-border ${plan.popular ? "ring-2 ring-primary" : ""}`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <div className="inline-flex items-center rounded-full bg-primary px-3 py-1 text-sm font-medium text-primary-foreground">
                    <Star className="mr-1 h-3 w-3" />
                    Most Popular
                  </div>
                </div>
              )}

              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                  <span className="text-muted-foreground">/{plan.period}</span>
                </div>
                <CardDescription className="mt-2">{plan.description}</CardDescription>
              </CardHeader>

              <CardContent>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center space-x-3">
                      <Check className="h-4 w-4 text-primary flex-shrink-0" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className={`w-full ${
                    plan.popular
                      ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                      : "bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                  }`}
                  size="lg"
                >
                  {plan.cta}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-muted-foreground">
            All plans include SSL encryption, GDPR compliance, and 99.9% uptime guarantee.
          </p>
        </div>
      </div>
    </section>
  )
}
