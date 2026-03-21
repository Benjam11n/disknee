import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export function EncouragementSection() {
  return (
    <Card>
      <CardContent className="p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">You've Got This!</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Recovery is a journey, not a race. Every day you show up for yourself,
          you're making progress. Be patient, stay consistent, and celebrate
          every small victory along the way. We believe in you!
        </p>
        <Badge className="mt-4 px-4 py-2">
          Day 1 of your stronger future starts today!
        </Badge>
      </CardContent>
    </Card>
  );
}
