import { Suspense } from 'react';
import { createServerClient } from '@/lib/supabase/server';
import { InventoryManagement } from '@/components/inventory/InventoryManagement';
import type { InventoryItem } from '@/lib/types';
import { Package } from 'lucide-react';

export const dynamic = 'force-dynamic';

async function getInventoryData() {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('inventory_items_enriched')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching inventory:', error);
    return { items: [], error: error.message };
  }

  return { items: (data as InventoryItem[]) || [], error: null };
}

export default async function InventoryPage() {
  const { items, error } = await getInventoryData();

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Package className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-lg font-semibold">Failed to load inventory</h2>
        <p className="text-sm text-muted-foreground mt-1">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage your R&D inventory items
          </p>
        </div>
      </div>

      <Suspense fallback={<InventorySkeleton />}>
        <InventoryManagement initialItems={items} />
      </Suspense>
    </div>
  );
}

function InventorySkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <div className="h-10 w-64 bg-muted rounded animate-pulse" />
        <div className="h-10 w-32 bg-muted rounded animate-pulse" />
        <div className="h-10 w-32 bg-muted rounded animate-pulse ml-auto" />
      </div>
      <div className="rounded-lg border">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 border-b last:border-0 bg-muted/20 animate-pulse" />
        ))}
      </div>
    </div>
  );
}
