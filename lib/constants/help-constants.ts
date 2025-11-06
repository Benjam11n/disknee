import { Heart, TrendingUp, Clock, Award } from 'lucide-react';

export const faqs = [
  {
    category: 'Getting Started',
    questions: [
      {
        q: 'How often should I do my exercises?',
        a: 'Follow the exercise frequency set by your doctor or therapist. If no specific plan is provided, start with 3-4 sessions per week, about 15-20 minutes each. Always prioritize consistency over intensity, especially when beginning your recovery journey.',
      },
      {
        q: 'What if I miss a day?',
        a: "Don't worry! Missing one day won't set you back. Just get back on track the next day. The key is to not let one missed day become a week. Every small effort counts!",
      },
      {
        q: 'How long until I see improvement?',
        a: "Everyone's journey is different, but most people start feeling better within 2-3 weeks with consistent practice. Remember, healing takes time - celebrate small improvements along the way!",
      },
    ],
  },
  {
    category: 'Exercise Guidance',
    questions: [
      {
        q: 'Is it normal to feel some discomfort?',
        a: "Mild muscle soreness is normal, especially when starting. Sharp pain is not. If you feel sharp pain, stop and rest. The motto is 'listen to your body' - it knows best!",
      },
      {
        q: "How do I know if I'm doing the exercises right?",
        a: "Focus on form over speed. Watch the demo videos carefully. If something doesn't feel right, pause and check your position. Quality movements beat quantity every time.",
      },
      {
        q: 'Can I do extra repetitions?',
        a: "Follow your therapist's recommendation initially. Once you feel comfortable, you can discuss increasing repetitions with your therapist. More isn't always better - proper form matters most!",
      },
    ],
  },
  {
    category: 'Staying Motivated',
    questions: [
      {
        q: 'How do I stay motivated on difficult days?',
        a: "Remember why you started! Think about the activities you want to return to. Even 5 minutes counts. On tough days, be kind to yourself - you're already doing something amazing for your recovery.",
      },
      {
        q: "What if I feel like I'm not progressing?",
        a: "Progress isn't always linear. Some weeks you'll feel stronger, others you might feel the same. Keep a simple journal of your activities - you'll be surprised how far you've come!",
      },
    ],
  },
];

export const motivationalTips = [
  {
    icon: Heart,
    title: 'Your Body is Capable',
    description:
      "Trust in your body's ability to heal. Every small movement is a step toward recovery.",
  },
  {
    icon: TrendingUp,
    title: 'Progress, Not Perfection',
    description: 'Aim for consistency, not perfection. Showing up matters more than being perfect.',
  },
  {
    icon: Clock,
    title: 'Patience is Power',
    description:
      "Healing takes time. Be patient with yourself - you're doing this one day at a time.",
  },
  {
    icon: Award,
    title: 'Celebrate Small Wins',
    description: "Completed your exercises today? That's a win! Every effort deserves recognition.",
  },
];

export const emergencyInfo = [
  {
    title: 'Seek Immediate Care If:',
    items: [
      "Sudden, severe pain that doesn't improve",
      'Inability to bear weight on your knee',
      'Visible deformity or swelling',
      "Numbness or tingling that doesn't go away",
      'Fever or signs of infection',
    ],
  },
  {
    title: 'Contact Your Therapist For:',
    items: [
      'Pain that gets worse with exercises',
      'New or unusual symptoms',
      'Questions about your exercise routine',
      'Concerns about your progress',
    ],
  },
];
