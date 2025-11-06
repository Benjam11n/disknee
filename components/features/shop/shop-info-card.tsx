import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export function ShopInfoCard() {
  return (
    <Card className="bg-muted/30">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="outline">💡</Badge>
          <h3 className="font-semibold">How to earn points</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Complete exercises and submit reflections to earn points. Each session gives you points
          based on your accuracy, with a bonus for leaving feedback!
        </p>
        <Separator className="my-2" />
        <p className="text-sm text-muted-foreground">
          <strong>Score Formula:</strong> (Accuracy × 100) + 20 bonus for reflection
        </p>
      </CardContent>
    </Card>
  );
}
