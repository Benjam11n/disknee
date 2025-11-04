"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ROUTES } from "@/lib/constants/routes";
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
import { reflectionSchema, ReflectionFormData } from "@/lib/validations/reflection-validations";
import { getFatigueLabel } from "@/lib/utils/session-utils";
import { SessionSummary } from "@/components/dashboard/SessionSummary";

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

    toast.success("Thank you for your feedback! Session completed.");
    onSubmit(reflectionData);
    router.push(ROUTES.DASHBOARD);
  };

  const handleSkip = () => {
    console.log("User skipped reflection");
    toast.success("Session completed! Keep up the great work!");
    onSkip();
    router.push(ROUTES.DASHBOARD);
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
      <SessionSummary sessionData={sessionData} />

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
