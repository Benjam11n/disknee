import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

export function HelpHeroSection() {
  return (
    <div className="text-center space-y-6 py-8 bg-primary/5 border border-primary/10 rounded-2xl px-8">
      <div className="space-y-4">
        <Badge className="bg-primary/10 text-primary px-4 py-2 text-sm">
          You're doing great! Keep going! 💪
        </Badge>
        <h1 className="text-4xl font-bold tracking-tight">Your Recovery Journey</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Every step forward is progress. We're here to support you through your knee recovery with
          guidance, motivation, and encouragement.
        </p>
      </div>

      {/* Search Bar (Disabled for demo) */}
      <div className="relative max-w-md mx-auto">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input placeholder="Search for help..." disabled className="pl-10 bg-muted/30" />
        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-muted-foreground">
          Coming soon
        </span>
      </div>
    </div>
  );
}
