'use client';

import { useMemo } from 'react';
import { InventoryItem } from '@/lib/types';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { gbp } from '@/lib/currency';

type Props = {
  items: InventoryItem[];
};

const COLORS = ['#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#ec4899'];

export function DashboardCharts({ items }: Props) {
  // Value by Category
  const valueByCategory = useMemo(() => {
    const categoryMap = new Map<string, number>();
    items.forEach(item => {
      const category = item.category || 'Uncategorized';
      const value = item.total_value || (item.price_per_unit * item.units);
      categoryMap.set(category, (categoryMap.get(category) || 0) + value);
    });
    return Array.from(categoryMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [items]);

  // Expiration Timeline
  const expirationTimeline = useMemo(() => {
    const monthCounts = new Map<string, number>();
    const now = new Date();

    items.forEach(item => {
      if (!item.expiration_date) return;
      const expDate = new Date(item.expiration_date);
      if (expDate < now) {
        monthCounts.set('Expired', (monthCounts.get('Expired') || 0) + 1);
      } else {
        const monthKey = expDate.toLocaleDateString('en-GB', { year: 'numeric', month: 'short' });
        monthCounts.set(monthKey, (monthCounts.get(monthKey) || 0) + 1);
      }
    });

    return Array.from(monthCounts.entries())
      .map(([month, count]) => ({ month, count }))
      .slice(0, 12);
  }, [items]);

  // Low Stock by Category
  const lowStockByCategory = useMemo(() => {
    const categoryMap = new Map<string, number>();
    items.forEach(item => {
      if (item.is_low_stock) {
        const category = item.category || 'Uncategorized';
        categoryMap.set(category, (categoryMap.get(category) || 0) + 1);
      }
    });
    return Array.from(categoryMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [items]);

  // Top 10 Most Expensive Items
  const topExpensive = useMemo(() => {
    return items
      .map(item => ({
        name: item.name.length > 20 ? item.name.substring(0, 20) + '...' : item.name,
        value: item.total_value || (item.price_per_unit * item.units)
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }, [items]);

  const totalValue = items.reduce((sum, item) => sum + (item.total_value || item.price_per_unit * item.units), 0);
  const lowStockCount = items.filter(item => item.is_low_stock).length;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Total Inventory Value</h3>
          <p className="text-3xl font-bold mt-2">{gbp.format(totalValue)}</p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Total Items</h3>
          <p className="text-3xl font-bold mt-2">{items.length}</p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Low Stock Items</h3>
          <p className="text-3xl font-bold mt-2 text-destructive">{lowStockCount}</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Inventory Value by Category */}
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-lg font-semibold mb-4">Inventory Value by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={valueByCategory}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip formatter={(value) => gbp.format(Number(value))} />
              <Bar dataKey="value" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Expiration Timeline */}
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-lg font-semibold mb-4">Expiration Timeline</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={expirationTimeline}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Low Stock Distribution */}
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-lg font-semibold mb-4">Low Stock by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={lowStockByCategory}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top 10 Most Expensive Items */}
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-lg font-semibold mb-4">Top 10 Most Expensive Items</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topExpensive} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={150} />
              <Tooltip formatter={(value) => gbp.format(Number(value))} />
              <Bar dataKey="value" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
