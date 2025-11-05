"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { MoodSelector } from "./mood-selector";
import { Mood } from "@prisma/client";
import { logger } from "@/lib/logger";

interface DailyCheckInDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onCheckInComplete?: (
    mood: Mood,
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
  const [selectedMood, setSelectedMood] = useState<Mood | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [encouragement, setEncouragement] = useState("");

  const handleMoodSelect = (mood: Mood, message: string) => {
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
      // Calculate points based on mood
      const moodPoints = {
        [Mood.ENERGIZED]: 15,
        [Mood.OKAY]: 10,
        [Mood.TIRED]: 5,
        [Mood.FRUSTRATED]: 5,
      };

      const points = moodPoints[selectedMood];

      // TODO: Call API to save check-in
      // await checkInAction({ userId, mood: selectedMood, points });

      // Award streak bonus points
      let streakBonus = 0;
      if (selectedMood === Mood.ENERGIZED) streakBonus = 5;
      if (selectedMood === Mood.OKAY) streakBonus = 3;

      const totalPoints = points + streakBonus;

      // Call parent callback if provided
      if (onCheckInComplete) {
        onCheckInComplete(selectedMood, totalPoints, encouragement);
      }

      // Show success toast
      toast.success(`Check-in complete! +${totalPoints} points earned!`, {
        duration: 3000,
        action: {
          label: "View Dashboard",
          onClick: () => router.push("/dashboard"),
        },
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
