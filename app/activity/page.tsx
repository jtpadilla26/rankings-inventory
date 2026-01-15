import { Activity as ActivityIcon } from 'lucide-react';

export default function ActivityPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Activity Log</h1>
        <p className="text-muted-foreground mt-1">
          Track inventory changes and transactions
        </p>
      </div>

      <div className="flex flex-col items-center justify-center py-12 border rounded-lg bg-card">
        <ActivityIcon className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold">Activity Tracking Coming Soon</h3>
        <p className="text-sm text-muted-foreground mt-2 max-w-md text-center">
          Activity logging will track all inventory changes, stock adjustments, and user actions.
          This feature requires a separate activity_log or transactions table in the database.
        </p>
      </div>
    </div>
  );
}
