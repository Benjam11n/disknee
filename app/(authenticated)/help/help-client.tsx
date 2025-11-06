import { HelpHeroSection } from '@/components/features/help/help-hero-section';
import { QuickActions } from '@/components/features/help/quick-actions';
import { FirstWeekGuide } from '@/components/features/help/first-week-guide';
import { FAQSection } from '@/components/features/help/faq-section';
import { ContactSupportSection } from '@/components/features/help/contact-support-section';
import { EncouragementSection } from '@/components/features/help/encouragement-section';

export function HelpClient() {
  return (
    <div className="container max-w-6xl mx-auto p-6 space-y-8">
      <HelpHeroSection />
      <QuickActions />
      <FirstWeekGuide />
      <FAQSection />
      <ContactSupportSection />
      <EncouragementSection />
    </div>
  );
}
