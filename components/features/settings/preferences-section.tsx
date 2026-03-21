import { Palette } from "lucide-react";

import { ThemeToggle } from "@/components/shared/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export function PreferencesSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Preferences
        </CardTitle>
        <CardDescription>
          Customize your application experience.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="font-medium">Dark Mode</h3>
            <p className="text-sm text-muted-foreground">
              Toggle between light and dark themes.
            </p>
          </div>
          <ThemeToggle />
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="font-medium">Email Notifications</h3>
            <p className="text-sm text-muted-foreground">
              Receive email updates about your progress.
            </p>
          </div>
          <Button variant="outline" size="sm" disabled>
            Configure
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
