"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Users, Activity, Award } from "lucide-react";
import { ROUTES } from "@/lib/constants/routes";

interface HeroProps {
  onLearnMore?: () => void;
}

export function Hero({ onLearnMore }: HeroProps) {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h1 className="text-4xl lg:text-6xl font-bold tracking-tight">
          AI-Powered Virtual Physiotherapy for
          <span className="text-primary"> Knee Rehabilitation</span>
        </h1>
        <p className="text-xl text-muted-foreground lg:text-2xl mb-8">
          Recover smarter with personalized exercise plans, real-time AI
          feedback, and comprehensive progress tracking—all from the
          comfort of your home.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <Link href={ROUTES.LOGIN}>
          <Button size="lg" className="text-lg px-8 py-6 h-auto">
            Get Started Today
          </Button>
        </Link>
        <Button
          size="lg"
          variant="outline"
          onClick={onLearnMore}
          className="text-lg px-8 py-6 h-auto"
        >
          Learn More
        </Button>
      </div>

      <div className="flex items-center gap-8 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          <span>500+ Patients</span>
        </div>
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4" />
          <span>95% Success Rate</span>
        </div>
        <div className="flex items-center gap-2">
          <Award className="h-4 w-4" />
          <span>Award Winning</span>
        </div>
      </div>
    </div>
  );
}