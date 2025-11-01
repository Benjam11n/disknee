import { Calendar, Clock, MapPin } from "lucide-react";
import { Card } from "@/components/ui/card";
import { formatTime } from "@/lib/date-utils";
import { Appointment } from "@prisma/client";

interface AppointmentCardProps {
  appointment: Appointment;
  compact?: boolean;
}

export function AppointmentCard({
  appointment,
  compact = false,
}: AppointmentCardProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Card
      className={`p-4 hover:shadow-md transition-all duration-200 ${
        compact ? "p-3" : ""
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            <span className="font-medium">
              {formatDate(appointment.start.toISOString())}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{formatTime(appointment.start.toISOString())}</span>
          </div>

          {appointment.locationName && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-3 w-3" />
              <span>{appointment.locationName}</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
