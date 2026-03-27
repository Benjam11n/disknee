import Link from "next/link";

import { Logo } from "@/components/shared/logo";

/**
 * Landing page footer component.
 */
export function LandingPageFooter() {
  return (
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
                <Link href="/#features" className="hover:text-foreground">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/#how-it-works" className="hover:text-foreground">
                  How It Works
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Company</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <span className="text-muted-foreground/80">
                  Built by DisKnee
                </span>
              </li>
              <li>
                <Link href="/help" className="hover:text-foreground">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Legal</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <span className="text-muted-foreground/80">
                  Privacy available on request
                </span>
              </li>
              <li>
                <span className="text-muted-foreground/80">
                  Terms available on request
                </span>
              </li>
              <li>
                <span className="text-muted-foreground/80">
                  HIPAA-aware design
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>&copy; 2026 DisKnee. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
