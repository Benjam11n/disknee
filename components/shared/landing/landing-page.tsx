'use client';

import { LandingPageNavbar } from '@/components/shared/landing/landing-page-navbar';
import { LandingPageFooter } from '@/components/shared/landing/landing-page-footer';
import { Hero } from '@/components/shared/landing/hero';

import { Features } from '@/components/shared/landing/features';

export function LandingPage() {
  const scrollToFeatures = () => {
    const element = document.getElementById('features');
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background selection:bg-primary/30">
      <LandingPageNavbar scrollToFeatures={scrollToFeatures} />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden border-b border-border/40">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px]"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-center">
          <Hero onLearnMore={scrollToFeatures} />
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-zinc-50 dark:bg-zinc-950/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Features />
        </div>
      </section>

      {/* Footer */}
      <LandingPageFooter />
    </div>
  );
}
