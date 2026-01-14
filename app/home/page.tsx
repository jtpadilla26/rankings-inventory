import { Suspense } from 'react';
import { supabase } from '@/lib/supabase/client';
import { InventoryItem } from '@/lib/types';
import { TotalInventoryValueCard } from '@/components/dashboard/TotalInventoryValueCard';
import { LowStockCard } from '@/components/dashboard/LowStockCard';
import { InventorySnapshot } from '@/components/home/InventorySnapshot';
import { ExpirationSnapshot } from '@/components/home/ExpirationSnapshot';
import { WhatsLowModule } from '@/components/home/WhatsLowModule';
import { Package, TrendingUp, AlertTriangle } from 'lucide-react';

export const dynamic = 'force-dynamic';

async function getInventorySummary() {
  const { data, error } = await supabase
    .from('inventory_items_enriched')
    .select('*')
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching inventory:', error);
    return { items: [], totalValue: 0, totalItems: 0, lowStockCount: 0 };
  }

  const items = (data as InventoryItem[]) || [];
  const totalValue = items.reduce((sum, item) => sum + (item.total_value || item.price_per_unit * item.units), 0);
  const totalItems = items.length;
  const lowStockCount = items.filter(item => item.is_low_stock).length;

  return { items, totalValue, totalItems, lowStockCount };
}

export default async function HomePage() {
  const { items, totalValue, totalItems, lowStockCount } = await getInventorySummary();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Home Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to your R&D inventory management system
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Suspense fallback={<KPICardSkeleton />}>
          <TotalInventoryValueCard />
        </Suspense>

        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Total Items</h3>
            <Package className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold">{totalItems}</p>
            <p className="text-xs text-muted-foreground">
              Active inventory items
            </p>
          </div>
        </div>

        <Suspense fallback={<KPICardSkeleton />}>
          <LowStockCard />
        </Suspense>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Inventory Snapshot */}
        <Suspense fallback={<ModuleSkeleton />}>
          <InventorySnapshot items={items.slice(0, 8)} />
        </Suspense>

        {/* What's Low Module */}
        <Suspense fallback={<ModuleSkeleton />}>
          <WhatsLowModule items={items.filter(item => item.is_low_stock).slice(0, 8)} />
        </Suspense>

        {/* Expiration Snapshot - Full Width */}
        <div className="lg:col-span-2">
          <Suspense fallback={<ModuleSkeleton />}>
            <ExpirationSnapshot items={items} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

function KPICardSkeleton() {
  return (
    <div className="rounded-lg border bg-card p-6">
      <div className="animate-pulse space-y-3">
        <div className="h-4 w-24 bg-muted rounded" />
        <div className="h-8 w-32 bg-muted rounded" />
        <div className="h-3 w-40 bg-muted rounded" />
      </div>
    </div>
  );
}

function ModuleSkeleton() {
  return (
    <div className="rounded-lg border bg-card p-6">
      <div className="animate-pulse space-y-4">
        <div className="h-6 w-48 bg-muted rounded" />
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-12 bg-muted rounded" />
          ))}
        </div>
      </div>
    </div>
  );
}
