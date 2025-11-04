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
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
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
import { ThemeToggle } from "@/components/shared/theme/theme-toggle";
import {
  User,
  Mail,
  LogOut,
  Shield,
  Bell,
  Palette,
  Database,
  HelpCircle,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";

interface SettingsClientProps {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export function SettingsClient({ user }: SettingsClientProps) {
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
      console.error("Logout error:", error);
    } finally {
      setIsLoggingOut(false);
      setIsConfirmDialogOpen(false);
    }
  };

  return (
    <div className="container max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>

      {/* Profile Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Information
          </CardTitle>
          <CardDescription>
            View and manage your basic profile information.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user.image || ""} alt={user.name || ""} />
              <AvatarFallback className="text-2xl">
                {user.name
                  ?.split(" ")
                  .map((word) => word[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <h2 className="text-2xl font-semibold">{user.name}</h2>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>{user.email}</span>
              </div>
            </div>
          </div>
          <Separator />
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">User ID</span>
              <p className="font-mono mt-1">{user.id}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Account Status</span>
              <div className="mt-1">
                <Badge
                  variant="secondary"
                  className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                >
                  Active
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preferences Section */}
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

      {/* Privacy & Security Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Privacy & Security
          </CardTitle>
          <CardDescription>
            Manage your privacy and security settings.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 2FA Section */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="font-medium">Two-Factor Authentication</h3>
              <p className="text-sm text-muted-foreground">
                Add an extra layer of security to your account.
              </p>
            </div>
            <Button variant="outline" size="sm" disabled>
              <Shield className="h-4 w-4 mr-2" />
              Enable 2FA
            </Button>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="font-medium">Data Export</h3>
              <p className="text-sm text-muted-foreground">
                Download a copy of your personal data.
              </p>
            </div>
            <Button variant="outline" size="sm" disabled>
              <Database className="h-4 w-4 mr-2" />
              Export Data
            </Button>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="font-medium">Privacy Policy</h3>
              <p className="text-sm text-muted-foreground">
                Learn how we protect your data.
              </p>
            </div>
            <Button variant="outline" size="sm" disabled>
              View Policy
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 2FA Demo Section */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Two-Factor Authentication
          </CardTitle>
          <CardDescription>
            Protect your account with an additional layer of security (Demo)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4 p-4 border rounded-lg bg-muted/30">
            <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
              <span className="text-xs font-semibold">2FA</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4 className="font-medium">Status: Disabled</h4>
                <Badge variant="secondary">Not Active</Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Two-factor authentication is not currently enabled for your
                account.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Why enable 2FA?</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>
                    Adds an extra layer of security beyond just your password
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Protects your personal health data</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Prevents unauthorized access to your account</span>
                </li>
              </ul>
            </div>

            <Separator />

            <div>
              <h4 className="font-medium mb-2">How it works:</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-3 border rounded-lg">
                  <div className="text-2xl mb-2">📱</div>
                  <p className="text-sm font-medium">Step 1</p>
                  <p className="text-xs text-muted-foreground">
                    Enter your password
                  </p>
                </div>
                <div className="text-center p-3 border rounded-lg">
                  <div className="text-2xl mb-2">🔑</div>
                  <p className="text-sm font-medium">Step 2</p>
                  <p className="text-xs text-muted-foreground">
                    Enter 2FA code
                  </p>
                </div>
                <div className="text-center p-3 border rounded-lg">
                  <div className="text-2xl mb-2">✅</div>
                  <p className="text-sm font-medium">Step 3</p>
                  <p className="text-xs text-muted-foreground">
                    Access granted
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            <div className="bg-muted/30 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                <div>
                  <h4 className="font-medium">Coming Soon</h4>
                  <p className="text-sm text-muted-foreground">
                    Two-factor authentication will be available in a future
                    update. For now, ensure you use a strong, unique password.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <Button disabled className="w-full max-w-sm">
                Enable 2FA (Coming Soon)
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Session Actions */}
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
                  Are you sure you want to sign out? You'll need to sign in
                  again to access your account.
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

      {/* Help Section */}
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
    </div>
  );
}
