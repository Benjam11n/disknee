import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function EncouragementSection() {
  return (
    <Card className="bg-linear-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
      <CardContent className="p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">You've Got This!</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Recovery is a journey, not a race. Every day you show up for yourself, you're making
          progress. Be patient, stay consistent, and celebrate every small victory along the way. We
          believe in you!
        </p>
        <Badge className="mt-4 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 px-4 py-2">
          Day 1 of your stronger future starts today!
        </Badge>
      </CardContent>
    </Card>
  );
}
