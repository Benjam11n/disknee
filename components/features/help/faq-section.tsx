import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { HelpCircle } from 'lucide-react';
import { faqs } from '@/lib/constants/help-constants';

export function FAQSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HelpCircle className="h-5 w-5" />
          Frequently Asked Questions
        </CardTitle>
        <CardDescription>Common questions about your recovery journey</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {faqs.map((category) => (
            <div key={category.category} className="space-y-3">
              <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
                {category.category}
              </h4>
              <div className="space-y-2">
                {category.questions.map((faq, index) => (
                  <Card key={index} className="border-border/50">
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <h5 className="font-medium">{faq.q}</h5>
                        <p className="text-sm text-muted-foreground">{faq.a}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              {category.category !== faqs[faqs.length - 1].category && (
                <Separator className="my-6" />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
