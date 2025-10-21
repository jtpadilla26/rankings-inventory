'use client';

import useSWR from 'swr';

type InventorySummary = {
  low_stock_count: number;
};

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function LowStockCard() {
  const { data, error, isLoading } = useSWR<InventorySummary>('/api/inventory/summary', fetcher);
  if (isLoading) return <div className="text-muted-foreground">Loading…</div>;
  if (error || !data) return <div className="text-red-600">Failed to load</div>;

  return (
    <div className="rounded-2xl p-4 shadow-sm border bg-card">
      <div className="text-sm text-muted-foreground">Low-stock Items</div>
      <div className="mt-1 text-3xl font-semibold">{data.low_stock_count ?? 0}</div>
      <div className="mt-2 text-xs text-muted-foreground">Thresholds you set, only</div>
    </div>
  );
}
