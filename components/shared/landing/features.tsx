import {
  Target,
  Calendar,
  TrendingUp,
  Users,
  Shield,
  Award,
} from "lucide-react";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

export function Features() {
  const features = [
    {
      description:
        "Advanced pose detection monitors your form instantly, correcting unsafe movements to prevent injury.",
      icon: Target,
      title: "Real-time Tracking",
    },
    {
      description:
        "Your recovery protocol evolves daily based on your completion rates and form accuracy.",
      icon: Calendar,
      title: "Adaptive Programs",
    },
    {
      description:
        "Visualize your joint mobility and strength improvements through detailed, easy-to-read charts.",
      icon: TrendingUp,
      title: "Deep Analytics",
    },
    {
      description:
        "Share access directly with your physical therapist for remote monitoring and routine adjustments.",
      icon: Users,
      title: "Provider Clinics",
    },
    {
      description:
        "Bank-grade encryption ensures your health data remains completely private and secure.",
      icon: Shield,
      title: "HIPAA Compliant",
    },
    {
      description:
        "Stay committed with progress markers that celebrate your major recovery milestones.",
      icon: Award,
      title: "Milestone Tracking",
    },
  ];

  return (
    <div>
      <div className="text-center space-y-4 mb-20">
        <h2 className="text-3xl lg:text-5xl font-semibold tracking-tight">
          Everything you need to recover.
        </h2>
        <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
          We combine computer vision with clinical best practices to deliver a
          complete physical therapy experience in your living room.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <Card
            key={index}
            className="border-border/40 shadow-sm hover:shadow-md transition-shadow"
          >
            <CardHeader className="space-y-4 pb-4">
              <div className="w-10 h-10 rounded-lg border border-border/40 bg-white dark:bg-zinc-900 flex items-center justify-center shadow-sm">
                <feature.icon className="h-5 w-5 text-zinc-900 dark:text-zinc-100" />
              </div>
              <CardTitle className="text-lg font-medium text-zinc-950 dark:text-zinc-50">
                {feature.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-zinc-600 dark:text-zinc-400 text-base leading-relaxed">
                {feature.description}
              </CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
