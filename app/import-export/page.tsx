import { Suspense } from 'react';
import { ImportExportManager } from '@/components/import-export/ImportExportManager';
import { Upload, Download } from 'lucide-react';

export default function ImportExportPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Import / Export</h1>
          <p className="text-muted-foreground mt-1">
            Import inventory from CSV/Excel or export your current inventory
          </p>
        </div>
      </div>

      <Suspense fallback={<ImportExportSkeleton />}>
        <ImportExportManager />
      </Suspense>
    </div>
  );
}

function ImportExportSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {[...Array(2)].map((_, i) => (
        <div key={i} className="rounded-lg border bg-card p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 w-32 bg-muted rounded" />
            <div className="h-24 bg-muted rounded" />
            <div className="h-10 w-full bg-muted rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
