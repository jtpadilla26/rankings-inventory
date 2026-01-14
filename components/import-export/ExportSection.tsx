'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export function ExportSection() {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const response = await fetch('/api/export/items');
      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `inventory-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: 'Success',
        description: 'Inventory exported successfully',
      });
    } catch (error: any) {
      console.error('Export error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to export inventory',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="rounded-lg border bg-card p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/20">
          <Download className="h-5 w-5 text-green-600 dark:text-green-400" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Export Inventory</h2>
          <p className="text-sm text-muted-foreground">Download as CSV</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="rounded-md bg-muted/50 p-4 text-sm">
          <p className="font-medium mb-2">Export includes:</p>
          <ul className="space-y-1 text-muted-foreground">
            <li>• All inventory items and fields</li>
            <li>• Current stock levels and prices</li>
            <li>• Expiration dates and batch numbers</li>
            <li>• Compatible with Excel and Google Sheets</li>
          </ul>
        </div>

        <Button
          onClick={handleExport}
          disabled={isExporting}
          className="w-full"
          size="lg"
        >
          {isExporting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Export to CSV
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
