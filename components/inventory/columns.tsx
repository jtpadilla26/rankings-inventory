'use client';

import { ColumnDef } from '@tanstack/react-table';
import { InventoryItem } from '@/lib/types';
import { gbp } from '@/lib/currency';
import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';

function LowStockBadge({ item }: { item: InventoryItem }) {
  if (!item.low_stock_threshold) return null;
  if (!item.is_low_stock) return null;
  return (
    <span className="ml-2 rounded-full bg-red-100 text-red-700 text-xs px-2 py-0.5">
      Low
    </span>
  );
}

function ThresholdCell({ row }: any) {
  const item = row.original as InventoryItem;
  const [value, setValue] = useState<string>(
    item.low_stock_threshold == null ? '' : String(item.low_stock_threshold)
  );
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    const parsed = value === '' ? null : Number(value);
    await supabase
      .from('inventory_items')
      .update({ low_stock_threshold: parsed })
      .eq('id', item.id);
    setSaving(false);
  };

  return (
    <div className="flex items-center gap-2">
      <input
        className="w-24 rounded border px-2 py-1 text-sm"
        placeholder="—"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={save}
      />
      {saving ? <span className="text-xs text-muted-foreground">Saving…</span> : null}
    </div>
  );
}

export const inventoryColumns: ColumnDef<InventoryItem>[] = [
  { header: 'Name', accessorKey: 'name',
    cell: ({ row, getValue }) => (
      <div className="flex items-center">
        <span>{String(getValue() ?? '')}</span>
        <LowStockBadge item={row.original} />
      </div>
    )
  },
  { header: 'Category', accessorKey: 'category' },
  { header: 'Units', accessorKey: 'units',
    cell: ({ getValue }) => Number(getValue() ?? 0).toLocaleString('en-GB') },
  { header: 'Unit Type', accessorKey: 'unit_type' },
  { header: 'Price / Unit', accessorKey: 'price_per_unit',
    cell: ({ getValue }) => gbp.format(Number(getValue() ?? 0)) },
  { header: 'Total Value', accessorKey: 'total_value',
    cell: ({ row }) => {
      const p = Number(row.original.price_per_unit ?? 0);
      const u = Number(row.original.units ?? 0);
      const t = row.original.total_value ?? p * u;
      return gbp.format(Number(t || 0));
    },
  },
  // NEW:
  { header: 'Low-stock Threshold', cell: ThresholdCell },
  { header: 'Location', accessorKey: 'location' },
];
