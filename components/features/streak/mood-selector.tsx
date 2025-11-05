import { cn } from "@/lib/utils";
import { Mood } from "@prisma/client";

interface MoodOption {
  mood: Mood;
  emoji: string;
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  encouragement: string;
}

const moodOptions: MoodOption[] = [
  {
    mood: Mood.ENERGIZED,
    emoji: "😄",
    label: "Energized",
    color: "text-green-600",
    bgColor: "bg-green-50 hover:bg-green-100",
    borderColor: "border-green-200",
    encouragement: "Awesome! Let's push a little further today 💪",
  },
  {
    mood: Mood.OKAY,
    emoji: "🙂",
    label: "Okay",
    color: "text-blue-600",
    bgColor: "bg-blue-50 hover:bg-blue-100",
    borderColor: "border-blue-200",
    encouragement: "Great job! Consistency matters more than intensity.",
  },
  {
    mood: Mood.TIRED,
    emoji: "😔",
    label: "Tired",
    color: "text-orange-600",
    bgColor: "bg-orange-50 hover:bg-orange-100",
    borderColor: "border-orange-200",
    encouragement: "That's okay — listen to your body and take it easy today.",
  },
  {
    mood: Mood.FRUSTRATED,
    emoji: "😩",
    label: "Frustrated",
    color: "text-purple-600",
    bgColor: "bg-purple-50 hover:bg-purple-100",
    borderColor: "border-purple-200",
    encouragement: "You're not alone — this stage is tough, but you're building strength.",
  },
];

interface MoodSelectorProps {
  selectedMood?: Mood;
  onMoodSelect: (mood: Mood, encouragement: string) => void;
  disabled?: boolean;
}

export function MoodSelector({ selectedMood, onMoodSelect, disabled = false }: MoodSelectorProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium text-center mb-4">
          How are you feeling today?
        </h3>
        <p className="text-sm text-muted-foreground text-center">
          Your mood helps us tailor your session experience
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {moodOptions.map((option) => (
          <button
            key={option.mood}
            onClick={() => onMoodSelect(option.mood, option.encouragement)}
            disabled={disabled}
            className={cn(
              "relative p-4 rounded-xl border-2 transition-all duration-200",
              "hover:scale-105 active:scale-95",
              selectedMood === option.mood
                ? `${option.bgColor} ${option.borderColor} ring-2 ring-offset-2 ring-offset-background`
                : "bg-muted/30 border-muted hover:bg-muted/50",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            <div className="flex flex-col items-center gap-2">
              <span className="text-4xl">{option.emoji}</span>
              <span className={cn(
                "text-sm font-medium",
                selectedMood === option.mood ? option.color : "text-muted-foreground"
              )}>
                {option.label}
              </span>
            </div>
            {selectedMood === option.mood && (
              <div className="absolute -top-1 -right-1">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}