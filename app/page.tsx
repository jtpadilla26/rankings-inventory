import TotalInventoryValueCard from '@/components/dashboard/TotalInventoryValueCard';
import LowStockCard from '@/components/dashboard/LowStockCard';

export default function DashboardPage() {
  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
        <TotalInventoryValueCard />
        <LowStockCard />
        {/* Add other KPIs */}
      </div>
    </main>
  );
}
