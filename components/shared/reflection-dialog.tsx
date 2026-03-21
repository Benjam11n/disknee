"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { SessionSummary } from "@/components/features/dashboard/session-summary";
import { ReflectionFormFields } from "@/components/features/reflection/reflection-form-fields";
import { FormDialog } from "@/components/ui/form-dialog";
import { ROUTES } from "@/lib/constants/routes";
import { logger } from "@/lib/logger";
import type { ReflectionFormData } from "@/lib/validations/reflection-validations";
import { reflectionSchema } from "@/lib/validations/reflection-validations";

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
    defaultValues: {
      fatigue: [3],
      feedback: "",
      rating: [3],
    },
    resolver: zodResolver(reflectionSchema),
  });

  const handleFormSubmit = async (data: ReflectionFormData) => {
    setIsSubmitting(true);

    const reflectionData = {
      fatigue: data.fatigue[0],
      feedback: data.feedback,
      rating: data.rating[0],
    };

    // Log reflection data (for future database integration)
    logger.info(
      {
        ...reflectionData,
        sessionData,
        timestamp: new Date().toISOString(),
      },
      "Session Reflection:"
    );

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    toast.success("Thank you for your feedback! Session completed.");
    onSubmit(reflectionData);
    router.push(ROUTES.DASHBOARD);
  };

  const handleSkip = () => {
    logger.info("User skipped reflection");
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

      <ReflectionFormFields form={form} />
    </FormDialog>
  );
}
