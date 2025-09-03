'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Package,
  AlertTriangle,
  TrendingUp,
  Clock,
  DollarSign,
  Activity,
  ChevronRight,
  Filter,
  Calendar,
  Download,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { KPICard } from '@/components/dashboard/kpi-card';
import { ActivityFeed } from '@/components/dashboard/activity-feed';
import { CategoryChart } from '@/components/dashboard/category-chart';
import { StockStatusChart } from '@/components/dashboard/stock-status-chart';
import { UsageTrendChart } from '@/components/dashboard/usage-trend-chart';
import { ExpiryAlerts } from '@/components/dashboard/expiry-alerts';
import { useAnalytics } from '@/lib/hooks/use-analytics';
import { useRealtime } from '@/lib/hooks/use-realtime';
import { formatCurrency, formatNumber } from '@/lib/utils/formatters';

export default function DashboardPage() {
  const [timeRange, setTimeRange] = useState('7d');
  const [category, setCategory] = useState('all');
  const { kpis, charts, isLoading, refresh } = useAnalytics(timeRange, category);
  const { activities } = useRealtime();

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(refresh, 30000);
    return () => clearInterval(interval);
  }, [refresh]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-green-50">
      <div className="p-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Inventory Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              Rankins Test Plot - Real-time Overview
            </p>
          </div>

          <div className="flex gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <Calendar className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">Last 24h</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={refresh}>
              <Activity className="w-4 h-4 mr-2" />
              Refresh
            </Button>

            <Button>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </motion.div>

        {/* KPI Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4"
        >
          <motion.div variants={itemVariants}>
            <KPICard
              title="Total Stock Value"
              value={formatCurrency(kpis?.totalValue || 0)}
              change={kpis?.valueChange || 0}
              icon={DollarSign}
              color="purple"
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <KPICard
              title="Total SKUs"
              value={formatNumber(kpis?.totalItems || 0)}
              change={kpis?.itemsChange || 0}
              icon={Package}
              color="blue"
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <KPICard
              title="Low Stock Items"
              value={formatNumber(kpis?.lowStockCount || 0)}
              change={kpis?.lowStockChange || 0}
              icon={AlertTriangle}
              color="amber"
              alert={kpis?.lowStockCount > 0}
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <KPICard
              title="Overdue Checkouts"
              value={formatNumber(kpis?.overdueCount || 0)}
              change={kpis?.overdueChange || 0}
              icon={Clock}
              color="red"
              alert={kpis?.overdueCount > 0}
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <KPICard
              title="Chemicals Expiring"
              value={formatNumber(kpis?.expiringCount || 0)}
              subtitle="Within 60 days"
              icon={AlertTriangle}
              color="orange"
              alert={kpis?.expiringCount > 0}
            />
          </motion.div>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Charts Section - 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            {/* Category Breakdown */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="shadow-lg border-purple-100">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Category Breakdown</CardTitle>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="w-32">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="chemicals">Chemicals</SelectItem>
                      <SelectItem value="irrigation">Irrigation</SelectItem>
                      <SelectItem value="tools">Tools</SelectItem>
                      <SelectItem value="packaging">Packaging</SelectItem>
                    </SelectContent>
                  </Select>
                </CardHeader>
                <CardContent>
                  <CategoryChart data={charts?.categoryData || []} />
                </CardContent>
              </Card>
            </motion.div>

            {/* Usage Trend */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="shadow-lg border-green-100">
                <CardHeader>
                  <CardTitle>Usage Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <UsageTrendChart data={charts?.usageData || []} />
                </CardContent>
              </Card>
            </motion.div>

            {/* Stock Status */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="shadow-lg border-blue-100">
                <CardHeader>
                  <CardTitle>Stock Status Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <StockStatusChart data={charts?.stockStatus || []} />
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Right Sidebar - 1 column */}
          <div className="space-y-6">
            {/* Chemical Expiry Alerts */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="shadow-lg border-orange-100">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Expiry Alerts</span>
                    <Button variant="ghost" size="sm">
                      View All
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ExpiryAlerts items={charts?.expiringItems || []} />
                </CardContent>
              </Card>
            </motion.div>

            {/* Activity Feed */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card className="shadow-lg border-purple-100">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Recent Activity</span>
                    <Button variant="ghost" size="sm">
                      View All
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ActivityFeed activities={activities} />
                </CardContent>
              </Card>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
            >
              <Card className="shadow-lg border-green-100">
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button className="w-full justify-start" variant="outline">
                    <Package className="w-4 h-4 mr-2" />
                    Add New Item
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Stock In
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Activity className="w-4 h-4 mr-2" />
                    View Transactions
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Low Stock Report
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>

        {/* Bottom Stats Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Tabs defaultValue="topItems" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="topItems">Top Items</TabsTrigger>
              <TabsTrigger value="recentTransactions">Recent Transactions</TabsTrigger>
              <TabsTrigger value="pendingOrders">Pending Orders</TabsTrigger>
            </TabsList>
            <TabsContent value="topItems">
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    {charts?.topItems?.map((item: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-sm font-semibold text-purple-600">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-gray-500">{item.category}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{formatCurrency(item.value)}</p>
                          <p className="text-sm text-gray-500">{item.quantity} units</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="recentTransactions">
              <Card>
                <CardContent className="pt-6">
                  <p className="text-gray-500">Recent transactions will appear here</p>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="pendingOrders">
              <Card>
                <CardContent className="pt-6">
                  <p className="text-gray-500">No pending orders</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}
