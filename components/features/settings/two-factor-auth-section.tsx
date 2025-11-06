import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Shield, CheckCircle, AlertTriangle } from 'lucide-react';

export function TwoFactorAuthSection() {
  return (
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
              Two-factor authentication is not currently enabled for your account.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Why enable 2FA?</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Adds an extra layer of security beyond just your password</span>
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
                <p className="text-xs text-muted-foreground">Enter your password</p>
              </div>
              <div className="text-center p-3 border rounded-lg">
                <div className="text-2xl mb-2">🔑</div>
                <p className="text-sm font-medium">Step 2</p>
                <p className="text-xs text-muted-foreground">Enter 2FA code</p>
              </div>
              <div className="text-center p-3 border rounded-lg">
                <div className="text-2xl mb-2">✅</div>
                <p className="text-sm font-medium">Step 3</p>
                <p className="text-xs text-muted-foreground">Access granted</p>
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
                  Two-factor authentication will be available in a future update. For now, ensure
                  you use a strong, unique password.
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
  );
}
