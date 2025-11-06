'use client';

import { LandingPageNavbar } from '@/components/shared/landing/landing-page-navbar';
import { LandingPageFooter } from '@/components/shared/landing/landing-page-footer';
import { Hero } from '@/components/shared/landing/hero';
import { HeroMedia } from '@/components/shared/landing/hero-media';
import { Features } from '@/components/shared/landing/features';

export function LandingPage() {
  const scrollToFeatures = () => {
    const element = document.getElementById('features');
    element?.scrollIntoView({ behavior: 'smooth' });
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

      {/* Footer */}
      <LandingPageFooter />
    </div>
  );
}
