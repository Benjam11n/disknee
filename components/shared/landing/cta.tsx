import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants/routes";

export function CTA() {
  return (
    <div className="text-center">
      <div className="space-y-6">
        <h2 className="text-3xl lg:text-4xl font-bold">
          Start Your Recovery Journey Today
        </h2>
        <p className="text-xl text-muted-foreground">
          Join thousands of patients who have transformed their recovery with
          DisKnee.
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
  );
}
