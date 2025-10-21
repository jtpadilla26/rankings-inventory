import TotalInventoryValueCard from '@/components/dashboard/TotalInventoryValueCard';

export default function DashboardPage() {
  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
        <TotalInventoryValueCard />
        {/* Add more KPIs here (items count, low stock, etc.) */}
      </div>
    </main>
  );
}
