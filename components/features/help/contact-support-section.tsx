import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageCircle, Phone, Video, Mail } from 'lucide-react';

export function ContactSupportSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Need More Help?
        </CardTitle>
        <CardDescription>Our support team is here for you (coming soon)</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button variant="outline" className="justify-start" disabled>
            <Mail className="h-4 w-4 mr-2" />
            Email Support
          </Button>
          <Button variant="outline" className="justify-start" disabled>
            <Phone className="h-4 w-4 mr-2" />
            Call Us
          </Button>
          <Button variant="outline" className="justify-start" disabled>
            <Video className="h-4 w-4 mr-2" />
            Video Consultation
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
