"use client";

import Link from "next/link";
import { GlowBlob } from "@/components/glow-blob";
import { LandingPageNavbar } from "@/components/LandingPageNavbar";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Activity,
  Video,
  Target,
  Calendar,
  TrendingUp,
  Shield,
  Users,
  Award,
} from "lucide-react";
import { ROUTES } from "@/lib/constants/routes";

export function LandingPage() {
  const scrollToFeatures = () => {
    const element = document.getElementById("features");
    element?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <LandingPageNavbar scrollToFeatures={scrollToFeatures} />

      {/* Hero Section with GlowBlob */}
      <GlowBlob className="min-h-[600px] flex items-center justify-center">
        <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
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
                  onClick={scrollToFeatures}
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

            <div className="relative">
              <Card className="bg-background/60 backdrop-blur-sm border-2 shadow-2xl">
                <CardContent className="p-8">
                  <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg flex items-center justify-center">
                    <Video className="h-24 w-24 text-primary/50" />
                  </div>
                  <div className="mt-6 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-sm font-medium">
                        Real-time Motion Tracking
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Our AI analyzes your movements 30 times per second,
                      providing instant feedback on your exercise form.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </GlowBlob>

      {/* Features Section */}
      <section id="features" className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold">
              Everything You Need for Recovery
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              DisKnee combines cutting-edge AI technology with proven
              physiotherapy methods to accelerate your recovery journey.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="group hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6 space-y-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">AI-Powered Tracking</h3>
                <p className="text-muted-foreground">
                  Real-time pose detection ensures you're performing exercises
                  correctly, preventing injuries and maximizing results.
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6 space-y-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Personalized Programs</h3>
                <p className="text-muted-foreground">
                  Custom exercise plans tailored to your specific condition and
                  recovery goals, adjusted as you progress.
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6 space-y-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Progress Analytics</h3>
                <p className="text-muted-foreground">
                  Track your recovery with detailed insights, accuracy scores,
                  and improvement trends over time.
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6 space-y-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Virtual Appointments</h3>
                <p className="text-muted-foreground">
                  Connect with certified physiotherapists for remote
                  consultations and personalized guidance.
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6 space-y-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Safe & Secure</h3>
                <p className="text-muted-foreground">
                  HIPAA-compliant platform ensuring your health data is
                  protected with enterprise-grade security.
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6 space-y-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Award className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Gamified Recovery</h3>
                <p className="text-muted-foreground">
                  Stay motivated with achievements, progress milestones, and a
                  rewarding recovery journey.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-6">
            <h2 className="text-3xl lg:text-4xl font-bold">
              Start Your Recovery Journey Today
            </h2>
            <p className="text-xl text-muted-foreground">
              Join thousands of patients who have transformed their recovery
              with DisKnee.
            </p>
            <Link href={ROUTES.LOGIN} className="block">
              <Button size="lg" className="text-lg px-12 py-6 h-auto">
                Get Started Now
              </Button>
            </Link>
            <p className="text-sm text-muted-foreground">
              No credit card required • Free initial assessment
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-6">
              <Logo variant="text" size={40} className="mb-4" />
              <p className="text-sm text-muted-foreground max-w-xs">
                AI-powered virtual physiotherapy for smarter knee rehabilitation.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">Product</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#features" className="hover:text-foreground">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#how-it-works" className="hover:text-foreground">
                    How It Works
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="hover:text-foreground">
                    Pricing
                  </a>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">Company</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground">
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground">
                    HIPAA Compliance
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
            <p>&copy; 2024 DisKnee. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
