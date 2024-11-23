// ClubDayAlert.jsx
import { Alert, AlertDescription } from '@/components/ui/alert';

export function ClubDayAlert({ startTime, endTime }) {
  return (
    <Alert className="mb-6">
      <AlertDescription className="flex items-center justify-between">
        <span>Chess Club meets today! Make sure to check in all students.</span>
        <span className="text-sm text-gray-500">{startTime} - {endTime}</span>
      </AlertDescription>
    </Alert>
  );
}