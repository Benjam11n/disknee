"use client";

import { Calendar } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { checkInAction } from "@/lib/actions/streaks";
import { MOOD } from "@/lib/constants/client-enums";
import type { MoodValue } from "@/lib/constants/client-enums";
import { ROUTES } from "@/lib/constants/routes";
import { logger } from "@/lib/logger";

import { MoodSelector } from "./mood-selector";

interface DailyCheckInDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onCheckInComplete?: (
    mood: MoodValue,
    points: number,
    encouragement: string
  ) => void;
}

export function DailyCheckInDialog({
  isOpen,
  onClose,
  userId,
  onCheckInComplete,
}: DailyCheckInDialogProps) {
  const router = useRouter();
  const [selectedMood, setSelectedMood] = useState<MoodValue | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [encouragement, setEncouragement] = useState("");

  const handleMoodSelect = (mood: MoodValue, message: string) => {
    setSelectedMood(mood);
    setEncouragement(message);
  };

  const handleSubmit = async () => {
    if (!selectedMood) {
      toast.error("Please select how you're feeling");
      return;
    }

    setIsSubmitting(true);

    try {
      const moodPoints = {
        [MOOD.ENERGIZED]: 15,
        [MOOD.OKAY]: 10,
        [MOOD.TIRED]: 5,
        [MOOD.FRUSTRATED]: 5,
      };

      const points = moodPoints[selectedMood];

      const result = await checkInAction({
        mood: selectedMood,
        points,
        userId,
      });

      if (!result.success) {
        if (result.error === "Already checked in today") {
          toast.error("You've already checked in today!");
        } else {
          toast.error(result.error || "Failed to check in. Please try again.");
        }
        return;
      }

      // Get the actual points and streak data from the API response
      const { pointsEarned, streakBonus, mood: savedMood } = result.data!;

      // Call parent callback if provided
      if (onCheckInComplete) {
        onCheckInComplete(savedMood, pointsEarned, encouragement);
      }

      const message =
        streakBonus > 0
          ? `Check-in complete! +${pointsEarned} points earned (+${streakBonus} streak bonus!)`
          : `Check-in complete! +${pointsEarned} points earned!`;

      toast.success(message, {
        action: {
          label: "View Dashboard",
          onClick: () => router.push(ROUTES.DASHBOARD),
        },
        duration: 3000,
      });

      onClose();
    } catch (error) {
      logger.error(error, "Check-in error:");
      toast.error("Failed to check in. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    toast("Check in later to keep your streak going!");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Daily Check-In
          </DialogTitle>
          <DialogDescription>
            How are you feeling today? Your check-in helps us personalize your
            experience.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <MoodSelector
            selectedMood={selectedMood}
            onMoodSelect={handleMoodSelect}
            disabled={isSubmitting}
          />
        </div>

        {selectedMood && (
          <div className="mb-4 p-3 bg-muted/30 rounded-lg">
            <p className="text-sm text-center italic text-muted-foreground">
              "{encouragement}"
            </p>
          </div>
        )}

        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button
            variant="outline"
            onClick={handleSkip}
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            Skip
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            {isSubmitting ? "Checking in..." : "Complete Check-In"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
