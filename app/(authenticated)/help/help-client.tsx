"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import {
  Search,
  BookOpen,
  Target,
  Heart,
  TrendingUp,
  Clock,
  Award,
  PlayCircle,
  MessageCircle,
  Phone,
  AlertTriangle,
  CheckCircle,
  Star,
  Activity,
  Video,
  Mail,
  Shield,
  HelpCircle,
} from "lucide-react";

const faqs = [
  {
    category: "Getting Started",
    questions: [
      {
        q: "How often should I do my exercises?",
        a: "Follow the exercise frequency set by your doctor or therapist. If no specific plan is provided, start with 3-4 sessions per week, about 15-20 minutes each. Always prioritize consistency over intensity, especially when beginning your recovery journey.",
      },
      {
        q: "What if I miss a day?",
        a: "Don't worry! Missing one day won't set you back. Just get back on track the next day. The key is to not let one missed day become a week. Every small effort counts!",
      },
      {
        q: "How long until I see improvement?",
        a: "Everyone's journey is different, but most people start feeling better within 2-3 weeks with consistent practice. Remember, healing takes time - celebrate small improvements along the way!",
      },
    ],
  },
  {
    category: "Exercise Guidance",
    questions: [
      {
        q: "Is it normal to feel some discomfort?",
        a: "Mild muscle soreness is normal, especially when starting. Sharp pain is not. If you feel sharp pain, stop and rest. The motto is 'listen to your body' - it knows best!",
      },
      {
        q: "How do I know if I'm doing the exercises right?",
        a: "Focus on form over speed. Watch the demo videos carefully. If something doesn't feel right, pause and check your position. Quality movements beat quantity every time.",
      },
      {
        q: "Can I do extra repetitions?",
        a: "Follow your therapist's recommendation initially. Once you feel comfortable, you can discuss increasing repetitions with your therapist. More isn't always better - proper form matters most!",
      },
    ],
  },
  {
    category: "Staying Motivated",
    questions: [
      {
        q: "How do I stay motivated on difficult days?",
        a: "Remember why you started! Think about the activities you want to return to. Even 5 minutes counts. On tough days, be kind to yourself - you're already doing something amazing for your recovery.",
      },
      {
        q: "What if I feel like I'm not progressing?",
        a: "Progress isn't always linear. Some weeks you'll feel stronger, others you might feel the same. Keep a simple journal of your activities - you'll be surprised how far you've come!",
      },
    ],
  },
];

const motivationalTips = [
  {
    icon: Heart,
    title: "Your Body is Capable",
    description:
      "Trust in your body's ability to heal. Every small movement is a step toward recovery.",
  },
  {
    icon: TrendingUp,
    title: "Progress, Not Perfection",
    description:
      "Aim for consistency, not perfection. Showing up matters more than being perfect.",
  },
  {
    icon: Clock,
    title: "Patience is Power",
    description:
      "Healing takes time. Be patient with yourself - you're doing this one day at a time.",
  },
  {
    icon: Award,
    title: "Celebrate Small Wins",
    description:
      "Completed your exercises today? That's a win! Every effort deserves recognition.",
  },
];

const emergencyInfo = [
  {
    title: "Seek Immediate Care If:",
    items: [
      "Sudden, severe pain that doesn't improve",
      "Inability to bear weight on your knee",
      "Visible deformity or swelling",
      "Numbness or tingling that doesn't go away",
      "Fever or signs of infection",
    ],
  },
  {
    title: "Contact Your Therapist For:",
    items: [
      "Pain that gets worse with exercises",
      "New or unusual symptoms",
      "Questions about your exercise routine",
      "Concerns about your progress",
    ],
  },
];

export function HelpClient() {
  // Search and filter functionality coming soon
  // const [searchQuery, setSearchQuery] = useState("");
  // const [selectedCategory, setSelectedCategory] = useState("all");

  return (
    <div className="container max-w-6xl mx-auto p-6 space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-6 py-8 bg-primary/5 border border-primary/10 rounded-2xl px-8">
        <div className="space-y-4">
          <Badge className="bg-primary/10 text-primary px-4 py-2 text-sm">
            You're doing great! Keep going! 💪
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight">
            Your Recovery Journey
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Every step forward is progress. We're here to support you through
            your knee recovery with guidance, motivation, and encouragement.
          </p>
        </div>

        {/* Search Bar (Disabled for demo) */}
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search for help..."
            disabled
            className="pl-10 bg-muted/30"
          />
          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-muted-foreground">
            Coming soon
          </span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4 flex items-center gap-3">
            <BookOpen className="h-8 w-8 text-primary" />
            <div>
              <h3 className="font-semibold">Exercise Library</h3>
              <p className="text-sm text-muted-foreground">
                View all exercises
              </p>
            </div>
            <Button variant="ghost" size="sm" disabled>
              View
            </Button>
          </CardContent>
        </Card>

        <Card className="border-secondary/20 bg-secondary/5">
          <CardContent className="p-4 flex items-center gap-3">
            <PlayCircle className="h-8 w-8 text-secondary-foreground" />
            <div>
              <h3 className="font-semibold">Video Tutorials</h3>
              <p className="text-sm text-muted-foreground">
                Watch demonstrations
              </p>
            </div>
            <Button variant="ghost" size="sm" disabled>
              Watch
            </Button>
          </CardContent>
        </Card>

        <Card className="border-accent/20 bg-accent/5">
          <CardContent className="p-4 flex items-center gap-3">
            <MessageCircle className="h-8 w-8 text-accent-foreground" />
            <div>
              <h3 className="font-semibold">Chat Support</h3>
              <p className="text-sm text-muted-foreground">
                Talk to a therapist
              </p>
            </div>
            <Button variant="ghost" size="sm" disabled>
              Chat
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Getting Started Guide */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Your First Week
          </CardTitle>
          <CardDescription>
            Start your recovery journey with these simple steps
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                  1
                </div>
                <div>
                  <h4 className="font-semibold">Set Your Schedule</h4>
                  <p className="text-sm text-muted-foreground">
                    Schedule your exercise sessions according to your doctor's plan.
                    Mark them in your calendar like important appointments with yourself.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                  2
                </div>
                <div>
                  <h4 className="font-semibold">Create Your Space</h4>
                  <p className="text-sm text-muted-foreground">
                    Find a comfortable spot with enough room to move. Keep your
                    phone or tablet nearby for guidance.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                  3
                </div>
                <div>
                  <h4 className="font-semibold">Start Gentle</h4>
                  <p className="text-sm text-muted-foreground">
                    Begin with shorter sessions (10-15 minutes). It's okay to
                    start slow - you're building a habit!
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                  4
                </div>
                <div>
                  <h4 className="font-semibold">Track Everything</h4>
                  <p className="text-sm text-muted-foreground">
                    Note how you feel after each session. Even small
                    observations help you see progress.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                  5
                </div>
                <div>
                  <h4 className="font-semibold">Stay Hydrated</h4>
                  <p className="text-sm text-muted-foreground">
                    Drink water before and after exercises. Your muscles work
                    better when you're hydrated!
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                  6
                </div>
                <div>
                  <h4 className="font-semibold">Celebrate!</h4>
                  <p className="text-sm text-muted-foreground">
                    You did it! Acknowledge your effort. Every completed session
                    is a victory.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>
            Common questions about your recovery journey
          </CardDescription>
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
                          <p className="text-sm text-muted-foreground">
                            {faq.a}
                          </p>
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

      {/* Contact Support (Disabled for demo) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Need More Help?
          </CardTitle>
          <CardDescription>
            Our support team is here for you (coming soon)
          </CardDescription>
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

      {/* Final Encouragement */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
        <CardContent className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">You've Got This!</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Recovery is a journey, not a race. Every day you show up for
            yourself, you're making progress. Be patient, stay consistent, and
            celebrate every small victory along the way. We believe in you!
          </p>
          <Badge className="mt-4 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 px-4 py-2">
            Day 1 of your stronger future starts today!
          </Badge>
        </CardContent>
      </Card>
    </div>
  );
}
