'use client';

import Link from 'next/link';
import { InventoryItem } from '@/lib/types';
import { Package, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { gbp } from '@/lib/currency';

type Props = {
  items: InventoryItem[];
};

export function InventorySnapshot({ items }: Props) {
  if (!items || items.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Package className="h-5 w-5" />
            Inventory Snapshot
          </h2>
        </div>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Package className="h-12 w-12 text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">No inventory items yet</p>
          <Link href="/inventory">
            <Button variant="outline" size="sm" className="mt-4">
              Add Your First Item
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Package className="h-5 w-5" />
          Inventory Snapshot
        </h2>
        <Link href="/inventory">
          <Button variant="ghost" size="sm" className="gap-1">
            View All
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between p-3 rounded-md border bg-background hover:bg-accent transition-colors"
          >
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{item.name}</p>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span>{item.category || 'Uncategorized'}</span>
                <span>•</span>
                <span>{item.units} {item.unit_type || 'units'}</span>
                {item.location && (
                  <>
                    <span>•</span>
                    <span>{item.location}</span>
                  </>
                )}
              </div>
            </div>
            <div className="text-right ml-4">
              <p className="font-semibold">
                {gbp.format(item.total_value || item.price_per_unit * item.units)}
              </p>
              <p className="text-xs text-muted-foreground">
                {gbp.format(item.price_per_unit)}/unit
              </p>
            </div>
          </div>
        ))}
      </div>

      {items.length >= 8 && (
        <Link href="/inventory">
          <Button variant="outline" className="w-full mt-4">
            View All {items.length}+ Items
          </Button>
        </Link>
      )}
    </div>
  );
}
