import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AppointmentCard } from './appointment-card';
import { Appointment } from '@prisma/client';

interface UpcomingAppointmentsProps {
  appointments: Appointment[];
}

export function UpcomingAppointments({ appointments }: UpcomingAppointmentsProps) {
  if (appointments.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Appointments</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {appointments.map((apt, idx) => (
          <AppointmentCard key={apt.id || idx} appointment={apt} compact={true} />
        ))}
      </CardContent>
    </Card>
  );
}
