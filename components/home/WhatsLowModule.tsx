'use client';

import Link from 'next/link';
import { InventoryItem } from '@/lib/types';
import { AlertTriangle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

type Props = {
  items: InventoryItem[];
};

export function WhatsLowModule({ items }: Props) {
  if (!items || items.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-green-500" />
            What's Low
          </h2>
        </div>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <AlertTriangle className="h-12 w-12 text-green-500 mb-3" />
          <p className="text-sm font-medium text-green-600">All stock levels healthy!</p>
          <p className="text-xs text-muted-foreground mt-1">
            No items below their stock thresholds
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          What's Low
        </h2>
        <Badge variant="destructive">{items.length}</Badge>
      </div>

      <div className="space-y-2">
        {items.map((item) => {
          const threshold = item.effective_threshold || item.low_stock_threshold || 0;
          const percentRemaining = threshold > 0 ? (item.units / threshold) * 100 : 100;

          return (
            <div
              key={item.id}
              className="flex items-center justify-between p-3 rounded-md border border-destructive/20 bg-destructive/5"
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{item.name}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                  <span className="font-medium text-destructive">
                    {item.units} {item.unit_type || 'units'}
                  </span>
                  <span>•</span>
                  <span>Threshold: {threshold}</span>
                </div>
              </div>
              <div className="text-right ml-4">
                <Badge variant="destructive" className="text-xs">
                  {Math.round(percentRemaining)}% remaining
                </Badge>
              </div>
            </div>
          );
        })}
      </div>

      {items.length >= 8 && (
        <Link href="/inventory?filter=low-stock">
          <Button variant="outline" className="w-full mt-4">
            View All Low Stock Items
          </Button>
        </Link>
      )}
    </div>
  );
}
