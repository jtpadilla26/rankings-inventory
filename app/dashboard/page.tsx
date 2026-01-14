import { Suspense } from 'react';
import { supabase } from '@/lib/supabase/client';
import { InventoryItem } from '@/lib/types';
import { DashboardCharts } from '@/components/dashboard/DashboardCharts';
import { BarChart3 } from 'lucide-react';

export const dynamic = 'force-dynamic';

async function getDashboardData() {
  const { data, error } = await supabase
    .from('inventory_items_enriched')
    .select('*')
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching dashboard data:', error);
    return { items: [] };
  }

  return { items: (data as InventoryItem[]) || [] };
}

export default async function DashboardPage() {
  const { items } = await getDashboardData();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Insights and trends for your R&D inventory
        </p>
      </div>

      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardCharts items={items} />
      </Suspense>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="grid gap-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="rounded-lg border bg-card p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 w-48 bg-muted rounded" />
            <div className="h-64 bg-muted rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
