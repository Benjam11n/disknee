import { Calendar, Clock, MapPin } from "lucide-react";
import { Card } from "@/components/ui/card";
import { formatDateTime, formatTime } from "@/lib/utils/date-utils";
import { Appointment } from "@prisma/client";

interface AppointmentCardProps {
  appointment: Appointment;
  compact?: boolean;
}

export function AppointmentCard({
  appointment,
  compact = false,
}: AppointmentCardProps) {
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
              {formatDateTime(
                appointment.start instanceof Date
                  ? appointment.start.toISOString()
                  : appointment.start
              )}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>
              {formatTime["24hour"](
                appointment.start instanceof Date
                  ? appointment.start.toISOString()
                  : appointment.start
              )}
            </span>
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
