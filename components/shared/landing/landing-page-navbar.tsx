"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/shared/logo";
import { ROUTES } from "@/lib/constants/routes";
import { ThemeToggle } from "@/components/shared/theme/theme-toggle";

interface LandingPageNavbarProps {
  scrollToFeatures?: () => void;
}

export function LandingPageNavbar({
  scrollToFeatures,
}: LandingPageNavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleFeaturesClick = () => {
    scrollToFeatures?.();
  };

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Logo variant="icon" size={32} showText={true} />

          <div className="hidden md:flex items-center space-x-8">
            <button
              onClick={handleFeaturesClick}
              className="text-muted-foreground hover:text-foreground transition-colors text-left"
            >
              Features
            </button>
            <a
              href="#how-it-works"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              How It Works
            </a>
            <a
              href="#testimonials"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Testimonials
            </a>
            <Link href={ROUTES.LOGIN}>
              <Button>Sign In</Button>
            </Link>
            <ThemeToggle />
          </div>

          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-background border-b">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <button
              onClick={handleFeaturesClick}
              className="block px-3 py-2 text-muted-foreground hover:text-foreground transition-colors text-left w-full"
            >
              Features
            </button>
            <a
              href="#how-it-works"
              className="block px-3 py-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              How It Works
            </a>
            <a
              href="#testimonials"
              className="block px-3 py-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              Testimonials
            </a>
            <Link href={ROUTES.LOGIN} className="block px-3 py-2">
              <Button className="w-full">Sign In</Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
