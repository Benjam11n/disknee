"use client";

import { LandingPageNavbar } from "@/components/landing/landing-page-navbar";
import { LandingPageFooter } from "@/components/landing/landing-page-footer";
import { Hero } from "@/components/landing/hero";
import { HeroMedia } from "@/components/landing/hero-media";
import { Features } from "@/components/landing/features";
import { CTA } from "@/components/landing/cta";

export function LandingPage() {
  const scrollToFeatures = () => {
    const element = document.getElementById("features");
    element?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <LandingPageNavbar scrollToFeatures={scrollToFeatures} />

      {/* Hero Section with GlowBlob */}
      <div className="min-h-[600px] flex items-center justify-center">
        <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <Hero onLearnMore={scrollToFeatures} />
            <HeroMedia />
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section id="features" className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Features />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <CTA />
        </div>
      </section>

      {/* Footer */}
      <LandingPageFooter />
    </div>
  );
}
