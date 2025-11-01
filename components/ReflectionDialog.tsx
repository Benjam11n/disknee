"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { FormDialog } from "@/components/ui/form-dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Clock, Trophy } from "lucide-react";

// Form validation schema
const reflectionSchema = z.object({
  rating: z.array(z.number()).min(1).max(5),
  fatigue: z.array(z.number()).min(1).max(5),
  feedback: z.string().optional(),
});

type ReflectionFormData = z.infer<typeof reflectionSchema>;

interface SessionData {
  duration: number;
  repsCompleted: number;
  accuracy: number;
}

interface ReflectionDialogProps {
  isOpen: boolean;
  sessionData: SessionData;
  onSubmit: (data: {
    rating: number;
    fatigue: number;
    feedback?: string;
  }) => void;
  onSkip: () => void;
}

export function ReflectionDialog({
  isOpen,
  sessionData,
  onSubmit,
  onSkip,
}: ReflectionDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const form = useForm<ReflectionFormData>({
    resolver: zodResolver(reflectionSchema),
    defaultValues: {
      rating: [3],
      fatigue: [3],
      feedback: "",
    },
  });

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getFatigueLabel = (value: number): string => {
    switch (value) {
      case 1:
        return "Very Low";
      case 2:
        return "Low";
      case 3:
        return "Moderate";
      case 4:
        return "High";
      case 5:
        return "Very High";
      default:
        return "Moderate";
    }
  };

  const handleFormSubmit = async (data: ReflectionFormData) => {
    setIsSubmitting(true);

    const reflectionData = {
      rating: data.rating[0],
      fatigue: data.fatigue[0],
      feedback: data.feedback,
    };

    // Log reflection data (for future database integration)
    console.log("Session Reflection:", {
      ...reflectionData,
      sessionData,
      timestamp: new Date().toISOString(),
    });

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    onSubmit(reflectionData);
    router.push("/");
  };

  const handleSkip = () => {
    console.log("User skipped reflection");
    onSkip();
    router.push("/");
  };

  return (
    <FormDialog
      isOpen={isOpen}
      title="Session Complete!"
      description="Great job completing your physiotherapy session! Please share your feedback."
      onSubmit={form.handleSubmit(handleFormSubmit)}
      onSkip={handleSkip}
      isSubmitting={isSubmitting}
      submitText="Submit & Continue"
      skipText="Skip"
      className="sm:max-w-[600px]"
    >
      {/* Session Summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Session Summary</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <div>
                <div className="font-medium">
                  {formatTime(sessionData.duration)}
                </div>
                <div className="text-xs">Duration</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              <div>
                <div className="font-medium">
                  {sessionData.repsCompleted} reps
                </div>
                <div className="text-xs">Completed</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              <div>
                <div className="font-medium">{sessionData.accuracy}%</div>
                <div className="text-xs">Accuracy</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleFormSubmit)}
          className="space-y-6"
        >
          {/* Rating Field */}
          <FormField
            control={form.control}
            name="rating"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-medium">
                  How would you rate this session?
                </FormLabel>
                <FormControl>
                  <div className="space-y-2">
                    <Slider
                      min={1}
                      max={5}
                      step={1}
                      value={field.value}
                      onValueChange={field.onChange}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground px-2">
                      <span>Poor (1)</span>
                      <span>Excellent (5)</span>
                    </div>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Fatigue Level Field */}
          <FormField
            control={form.control}
            name="fatigue"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-medium">
                  How fatigued are you after the session?
                </FormLabel>
                <FormControl>
                  <div className="space-y-2">
                    <Slider
                      min={1}
                      max={5}
                      step={1}
                      value={field.value}
                      onValueChange={field.onChange}
                      className="w-full"
                    />
                    <div className="flex justify-center items-center gap-2 text-sm font-medium text-muted-foreground">
                      <span>
                        Current level: {getFatigueLabel(field.value[0])}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground px-2">
                      <span>🟢 Very Low</span>
                      <span>🟡 Moderate</span>
                      <span>🔴 Very High</span>
                    </div>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Feedback Field */}
          <FormField
            control={form.control}
            name="feedback"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-medium">
                  Any additional feedback? (Optional)
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Tell us about your experience, any discomfort, or suggestions for improvement..."
                    className="min-h-[100px] resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
    </FormDialog>
  );
}
