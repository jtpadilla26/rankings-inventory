'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { parseFile, buildPayload, upsertItems } from '@/lib/importers/items';
import { useRouter } from 'next/navigation';

export function ImportSection() {
  const { toast } = useToast();
  const router = useRouter();
  const [isImporting, setIsImporting] = useState(false);
  const [importLog, setImportLog] = useState<string[]>([]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportLog(['Reading file...']);

    try {
      const rows = await parseFile(file);
      setImportLog(prev => [...prev, `Parsed ${rows.length} rows`]);

      const { payload, errors } = await buildPayload(rows);

      if (errors.length > 0) {
        setImportLog(prev => [...prev, 'Issues found:', ...errors]);
      }

      setImportLog(prev => [...prev, `Inserting ${payload.length} items...`]);
      const { error, count } = await upsertItems(payload);

      if (error) throw new Error(error.message);

      setImportLog(prev => [...prev, `✓ Success! Inserted ${count} items.`]);

      toast({
        title: 'Import Complete',
        description: `Successfully imported ${count} items`,
      });

      router.refresh();

      // Clear log after a delay
      setTimeout(() => {
        setImportLog([]);
        // Reset file input
        e.target.value = '';
      }, 5000);
    } catch (error: any) {
      console.error('Import error:', error);
      setImportLog(prev => [...prev, `✗ Error: ${error.message || String(error)}`]);

      toast({
        title: 'Import Failed',
        description: error.message || 'Failed to import items',
        variant: 'destructive',
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="rounded-lg border bg-card p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/20">
          <Upload className="h-5 w-5 text-purple-600 dark:text-purple-400" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Import Inventory</h2>
          <p className="text-sm text-muted-foreground">Upload CSV or Excel file</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="rounded-md bg-muted/50 p-4 text-sm">
          <p className="font-medium mb-2">Supported columns:</p>
          <div className="text-xs text-muted-foreground space-y-1">
            <p>• <strong>name</strong> (required), category, units, unit_type</p>
            <p>• price_per_unit, location, batch_lot</p>
            <p>• expiration_date, date_added, notes</p>
            <p>• msds_url, low_stock_threshold</p>
            <p className="mt-2 text-amber-600 dark:text-amber-400">
              Note: total_value is computed and will be ignored
            </p>
          </div>
        </div>

        <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
          <input
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileChange}
            disabled={isImporting}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="cursor-pointer flex flex-col items-center"
          >
            {isImporting ? (
              <Loader2 className="h-8 w-8 text-primary animate-spin mb-2" />
            ) : (
              <Upload className="h-8 w-8 text-muted-foreground mb-2" />
            )}
            <p className="text-sm font-medium">
              {isImporting ? 'Importing...' : 'Click to upload'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              CSV or Excel (.xlsx, .xls)
            </p>
          </label>
        </div>

        {importLog.length > 0 && (
          <div className="rounded-md border bg-background p-3 text-xs font-mono space-y-1 max-h-48 overflow-y-auto">
            {importLog.map((log, i) => (
              <div
                key={i}
                className={
                  log.startsWith('✓') ? 'text-green-600 dark:text-green-400' :
                  log.startsWith('✗') ? 'text-destructive' :
                  log.includes('Issues') ? 'text-amber-600 dark:text-amber-400' :
                  'text-muted-foreground'
                }
              >
                {log}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
