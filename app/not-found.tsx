"use client";

import { Search, Home, ArrowLeft } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full flex items-center justify-center">
              <Search className="h-8 w-8" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            404 - Page Not Found
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-muted-foreground">
            The page you&apos;re looking for doesn&apos;t exist or has been
            moved.
          </p>

          <div className="space-y-2">
            <p className="text-sm text-center text-muted-foreground">
              You might want to:
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 ml-4">
              <li>• Check the URL for typos</li>
              <li>• Go back to the previous page</li>
              <li>• Visit your dashboard</li>
              <li>• Contact support if the problem persists</li>
            </ul>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => window.history.back()}
              className="flex-1"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
            <Button asChild className="flex-1">
              <Link href="/">
                <Home className="h-4 w-4 mr-2" />
                Dashboard
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
