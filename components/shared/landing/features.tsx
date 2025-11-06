import { Card, CardContent } from '@/components/ui/card';
import { Target, Calendar, TrendingUp, Users, Shield, Award } from 'lucide-react';

export function Features() {
  return (
    <div>
      <div className="text-center space-y-4 mb-16">
        <h2 className="text-3xl lg:text-4xl font-bold">Everything You Need for Recovery</h2>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          DisKnee combines cutting-edge AI technology with proven physiotherapy methods to
          accelerate your recovery journey.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        <Card className="group hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6 space-y-4">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <Target className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">AI-Powered Tracking</h3>
            <p className="text-muted-foreground">
              Real-time pose detection ensures you're performing exercises correctly, preventing
              injuries and maximizing results.
            </p>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6 space-y-4">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <Calendar className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Personalized Programs</h3>
            <p className="text-muted-foreground">
              Custom exercise plans tailored to your specific condition and recovery goals, adjusted
              as you progress.
            </p>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6 space-y-4">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Progress Analytics</h3>
            <p className="text-muted-foreground">
              Track your recovery with detailed insights, accuracy scores, and improvement trends
              over time.
            </p>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6 space-y-4">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Virtual Appointments</h3>
            <p className="text-muted-foreground">
              Connect with certified physiotherapists for remote consultations and personalized
              guidance.
            </p>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6 space-y-4">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Safe & Secure</h3>
            <p className="text-muted-foreground">
              HIPAA-compliant platform ensuring your health data is protected with enterprise-grade
              security.
            </p>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6 space-y-4">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <Award className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Gamified Recovery</h3>
            <p className="text-muted-foreground">
              Stay motivated with achievements, progress milestones, and a rewarding recovery
              journey.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
