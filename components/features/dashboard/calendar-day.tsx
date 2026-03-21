'use client';

interface CalendarDayProps {
  date: Date | null;
  isToday: boolean;
  isSelected: boolean;
  hasAppointment: boolean;
  hasPlan: boolean;
  onSelect?: (date: Date) => void;
  className?: string;
}

export function CalendarDay({
  date,
  isToday,
  isSelected,
  hasAppointment,
  hasPlan,
  onSelect,
  className,
}: CalendarDayProps) {
  if (!date) {
    return <div className="aspect-square" />;
  }

  const handleClick = () => {
    onSelect?.(date);
  };

  const baseClasses = `
    aspect-square rounded-lg flex flex-col items-center justify-center
    transition-all duration-200 cursor-pointer
    hover:scale-105 focus:outline-hidden focus:ring-2 focus:ring-primary focus:ring-offset-2
  `;

  const stateClasses = isSelected
    ? 'bg-primary text-primary-foreground hover:bg-primary/90'
    : isToday
      ? 'bg-accent text-accent-foreground hover:bg-accent/90'
      : 'bg-card hover:bg-card/80 text-foreground hover:text-foreground';

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`${baseClasses} ${stateClasses} ${className}`}
      aria-label={`Select date ${date.toDateString()}`}
      aria-pressed={isSelected}
    >
      <span className="text-sm font-medium">{date.getDate()}</span>

      {/* Indicators */}
      <div className="flex gap-1 mt-1">
        {hasAppointment && <div className="h-1.5 w-1.5 rounded-full bg-primary" />}
        {hasPlan && <div className="h-1.5 w-1.5 rounded-full bg-secondary" />}
      </div>
    </button>
  );
}
