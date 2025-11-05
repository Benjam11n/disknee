"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { ROUTES } from "@/lib/constants/routes";
import { LogOut } from "lucide-react";
import { logger } from "@/lib/logger";

export function SessionSection() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await authClient.signOut();
      toast.success("Logged out successfully");
      router.push(ROUTES.LOGIN);
    } catch (error) {
      toast.error("Failed to logout. Please try again.");
      logger.error(error, "Logout error:");
    } finally {
      setIsLoggingOut(false);
      setIsConfirmDialogOpen(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LogOut className="h-5 w-5" />
          Session
        </CardTitle>
        <CardDescription>Manage your current session.</CardDescription>
      </CardHeader>
      <CardContent>
        <Dialog
          open={isConfirmDialogOpen}
          onOpenChange={setIsConfirmDialogOpen}
        >
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full sm:w-auto">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Sign Out</DialogTitle>
              <DialogDescription>
                Are you sure you want to sign out? You'll need to sign in again
                to access your account.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsConfirmDialogOpen(false)}
                disabled={isLoggingOut}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleLogout}
                disabled={isLoggingOut}
              >
                {isLoggingOut ? "Signing out..." : "Sign Out"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
