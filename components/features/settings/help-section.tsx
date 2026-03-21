import { Bell, HelpCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function HelpSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HelpCircle className="h-5 w-5" />
          Help & Support
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Button variant="outline" className="justify-start" disabled>
            <Bell className="h-4 w-4 mr-2" />
            Contact Support
          </Button>
          <Button variant="outline" className="justify-start" disabled>
            <HelpCircle className="h-4 w-4 mr-2" />
            Help Center
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
