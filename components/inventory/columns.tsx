'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { ColumnDef } from '@tanstack/react-table';
import { supabase } from '@/lib/supabase/client';
import { gbp } from '@/lib/currency';
import type { InventoryItem } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, Pencil, Trash2, Plus, Minus } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';

export function ThresholdCell({ row }: any) {
  const item = row.original as { id: string; low_stock_threshold: number | null };
  const [val, setVal] = useState(item.low_stock_threshold == null ? '' : String(item.low_stock_threshold));
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    const parsed = val.trim() === '' ? null : Number(val.replace(/[^\d.\-]/g, ''));
    await supabase.from('inventory_items').update({ low_stock_threshold: parsed }).eq('id', item.id);
    setSaving(false);
  };

  return (
    <div className="flex items-center gap-2">
      <input
        className="w-24 rounded border px-2 py-1 text-sm"
        placeholder="—"
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onBlur={save}
      />
      {saving ? <span className="text-xs text-muted-foreground">Saving…</span> : null}
    </div>
  );
}

function LowBadge({ low }: { low: boolean | null | undefined }) {
  if (!low) return null;
  return <Badge variant="destructive" className="ml-2">Low</Badge>;
}

function ActionsCell({
  item,
  onUpdate,
  onDelete
}: {
  item: InventoryItem;
  onUpdate: (item: InventoryItem) => void;
  onDelete: (itemId: string) => void;
}) {
  const { toast } = useToast();
  const router = useRouter();
  const [showActions, setShowActions] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${item.name}"?`)) return;

    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('inventory_items')
        .delete()
        .eq('id', item.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Item deleted successfully',
      });

      onDelete(item.id);
      router.refresh();
    } catch (error: any) {
      console.error('Error deleting item:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete item',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAdjustStock = async (delta: number) => {
    const newUnits = Math.max(0, item.units + delta);

    try {
      const { data, error } = await supabase
        .from('inventory_items')
        .update({ units: newUnits })
        .eq('id', item.id)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Stock adjusted: ${item.units} → ${newUnits}`,
      });

      onUpdate(data as InventoryItem);
      router.refresh();
    } catch (error: any) {
      console.error('Error adjusting stock:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to adjust stock',
      });
    }
  };

  return (
    <div className="flex items-center gap-1">
      <Button
        size="sm"
        variant="ghost"
        onClick={() => handleAdjustStock(-1)}
        title="Decrease by 1"
        className="h-8 w-8 p-0"
      >
        <Minus className="h-4 w-4" />
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => handleAdjustStock(1)}
        title="Increase by 1"
        className="h-8 w-8 p-0"
      >
        <Plus className="h-4 w-4" />
      </Button>
      <Link href={`/inventory/${item.id}/edit`}>
        <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
          <Pencil className="h-4 w-4" />
        </Button>
      </Link>
      <Button
        size="sm"
        variant="ghost"
        onClick={handleDelete}
        disabled={isDeleting}
        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}

export const inventoryColumns = (
  onUpdate: (item: InventoryItem) => void,
  onDelete: (itemId: string) => void
): ColumnDef<InventoryItem>[] => [
  {
    header: 'Item',
    accessorKey: 'name',
    cell: ({ row, getValue }) => (
      <div className="flex items-center">
        <span className="font-medium">{String(getValue() ?? '')}</span>
        <LowBadge low={row.original.is_low_stock} />
      </div>
    ),
  },
  {
    header: 'Category',
    accessorKey: 'category',
    cell: ({ getValue }) => (
      <span className="text-sm">{String(getValue() ?? '—')}</span>
    ),
  },
  {
    header: 'Stock',
    accessorKey: 'units',
    cell: ({ getValue, row }) => (
      <span className="font-medium">
        {Number(getValue() ?? 0).toLocaleString('en-GB')} {row.original.unit_type || ''}
      </span>
    ),
  },
  {
    header: 'Price/Unit',
    accessorKey: 'price_per_unit',
    cell: ({ getValue }) => gbp.format(Number(getValue() ?? 0)),
  },
  {
    header: 'Total Value',
    accessorKey: 'total_value',
    cell: ({ row }) =>
      gbp.format(Number(row.original.total_value ?? row.original.price_per_unit * row.original.units)),
  },
  {
    header: 'Location',
    accessorKey: 'location',
    cell: ({ getValue }) => (
      <span className="text-sm text-muted-foreground">{String(getValue() ?? '—')}</span>
    ),
  },
  {
    header: 'Expiration',
    accessorKey: 'expiration_date',
    cell: ({ getValue }) => {
      const date = getValue() as string | null;
      if (!date) return <span className="text-sm text-muted-foreground">—</span>;

      const expDate = new Date(date);
      const now = new Date();
      const isExpired = expDate < now;
      const isExpiringSoon = expDate <= new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      return (
        <div className="text-sm">
          {expDate.toLocaleDateString('en-GB')}
          {isExpired && <Badge variant="destructive" className="ml-2 text-xs">Expired</Badge>}
          {!isExpired && isExpiringSoon && <Badge variant="default" className="ml-2 text-xs">Soon</Badge>}
        </div>
      );
    },
  },
  {
    header: 'Actions',
    cell: ({ row }) => (
      <ActionsCell
        item={row.original}
        onUpdate={onUpdate}
        onDelete={onDelete}
      />
    ),
  },
];
