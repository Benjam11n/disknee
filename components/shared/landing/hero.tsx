'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, ChevronRight } from 'lucide-react';
import { ROUTES } from '@/lib/constants/routes';

interface HeroProps {
  onLearnMore?: () => void;
}

export function Hero({ onLearnMore }: HeroProps) {
  return (
    <div className="space-y-8 max-w-3xl mx-auto flex flex-col items-center text-center">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-sm font-medium border border-zinc-200 dark:border-zinc-700">
        <span className="flex h-2 w-2 rounded-full bg-primary" />
        Intelligent Physical Therapy
        <ChevronRight className="h-4 w-4 text-muted-foreground ml-1" />
      </div>

      <div className="space-y-6">
        <h1 className="text-5xl lg:text-7xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
          Restore your mobility.
          <br className="hidden lg:block" />
          <span className="text-zinc-500">Accelerate recovery.</span>
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          DisKnee uses cutting-edge motion tracking to monitor your home exercises, correct your
          form in real-time, and get you back on your feet faster.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center w-full">
        <Link href={ROUTES.LOGIN}>
          <Button size="lg" className="h-12 px-8 text-base shadow-sm group w-full sm:w-auto">
            Start Recovering Free
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </Link>
        <Button
          size="lg"
          variant="outline"
          onClick={onLearnMore}
          className="h-12 px-8 text-base bg-transparent border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 w-full sm:w-auto"
        >
          Explore Features
        </Button>
      </div>
    </div>
  );
}
