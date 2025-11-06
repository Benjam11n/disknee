import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Shield, Database } from 'lucide-react';

export function PrivacySecuritySection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Privacy & Security
        </CardTitle>
        <CardDescription>Manage your privacy and security settings.</CardDescription>
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
            <p className="text-sm text-muted-foreground">Download a copy of your personal data.</p>
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
            <p className="text-sm text-muted-foreground">Learn how we protect your data.</p>
          </div>
          <Button variant="outline" size="sm" disabled>
            View Policy
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
