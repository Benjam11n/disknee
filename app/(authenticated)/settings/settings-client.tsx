import { ProfileSection } from "@/components/features/settings/profile-section";
import { PreferencesSection } from "@/components/features/settings/preferences-section";
import { PrivacySecuritySection } from "@/components/features/settings/privacy-security-section";
import { TwoFactorAuthSection } from "@/components/features/settings/two-factor-auth-section";
import { SessionSection } from "@/components/features/settings/session-section";
import { HelpSection } from "@/components/features/settings/help-section";
import { User } from "better-auth";

interface SettingsClientProps {
  user: User;
}

export function SettingsClient({ user }: SettingsClientProps) {
  return (
    <div className="container max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>

      <ProfileSection user={user} />
      <PreferencesSection />
      <PrivacySecuritySection />
      <TwoFactorAuthSection />
      <SessionSection />
      <HelpSection />
    </div>
  );
}
