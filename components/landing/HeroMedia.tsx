import { Card, CardContent } from "@/components/ui/card";
import { Video } from "lucide-react";

export function HeroMedia() {
  return (
    <div className="relative">
      <Card className="bg-background/60 backdrop-blur-sm border-2 shadow-2xl">
        <CardContent className="p-8">
          <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg flex items-center justify-center">
            <Video className="h-24 w-24 text-primary/50" />
          </div>
          <div className="mt-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium">Real-time Motion Tracking</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Our AI analyzes your movements 30 times per second,
              providing instant feedback on your exercise form.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}