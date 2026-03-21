import { BookOpen, PlayCircle, MessageCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function QuickActions() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4 flex items-center gap-3">
          <BookOpen className="h-8 w-8 text-primary" />
          <div>
            <h3 className="font-semibold">Exercise Library</h3>
            <p className="text-sm text-muted-foreground">View all exercises</p>
          </div>
          <Button variant="ghost" size="sm" disabled>
            View
          </Button>
        </CardContent>
      </Card>

      <Card className="border-secondary/20 bg-secondary/5">
        <CardContent className="p-4 flex items-center gap-3">
          <PlayCircle className="h-8 w-8 text-secondary-foreground" />
          <div>
            <h3 className="font-semibold">Video Tutorials</h3>
            <p className="text-sm text-muted-foreground">
              Watch demonstrations
            </p>
          </div>
          <Button variant="ghost" size="sm" disabled>
            Watch
          </Button>
        </CardContent>
      </Card>

      <Card className="border-accent/20 bg-accent/5">
        <CardContent className="p-4 flex items-center gap-3">
          <MessageCircle className="h-8 w-8 text-accent-foreground" />
          <div>
            <h3 className="font-semibold">Chat Support</h3>
            <p className="text-sm text-muted-foreground">Talk to a therapist</p>
          </div>
          <Button variant="ghost" size="sm" disabled>
            Chat
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
