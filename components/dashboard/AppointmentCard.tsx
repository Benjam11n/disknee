import { Calendar, Clock, MapPin } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatTime } from "@/lib/date-utils";

interface Appointment {
  date: string;
  time: string;
  location?: string;
  type?: string;
}

interface AppointmentCardProps {
  appointment: Appointment;
  compact?: boolean;
}

export function AppointmentCard({ appointment, compact = false }: AppointmentCardProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Card className={`p-4 hover:shadow-md transition-all duration-200 ${compact ? 'p-3' : ''}`}>
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            <span className="font-medium">{formatDate(appointment.date)}</span>
            {appointment.type && (
              <Badge variant="secondary" className="text-xs">
                {appointment.type}
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{formatTime(appointment.time)}</span>
          </div>

          {appointment.location && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-3 w-3" />
              <span>{appointment.location}</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}