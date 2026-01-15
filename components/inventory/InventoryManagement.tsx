'use client';

import { useState, useMemo } from 'react';
import { InventoryItem } from '@/lib/types';
import { Search, Plus, Filter, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import InventoryTable from '@/components/inventory/InventoryTable';
import { inventoryColumns } from '@/components/inventory/columns';
import { AddItemModal } from '@/components/inventory/AddItemModal';

type Props = {
  initialItems: InventoryItem[];
};

export function InventoryManagement({ initialItems }: Props) {
  const [items, setItems] = useState<InventoryItem[]>(initialItems);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [locationFilter, setLocationFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // Extract unique categories and locations
  const categories = useMemo(() => {
    const cats = new Set(
      items
        .map(item => item.category)
        .filter((cat): cat is string => cat != null && cat !== '')
    );
    return ['all', ...Array.from(cats).sort()];
  }, [items]);

  const locations = useMemo(() => {
    const locs = new Set(
      items
        .map(item => item.location)
        .filter((loc): loc is string => loc != null && loc !== '')
    );
    return ['all', ...Array.from(locs).sort()];
  }, [items]);

  // Filter items based on search and filters
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      // Search filter
      const matchesSearch = !searchQuery ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.batch_lot?.toLowerCase().includes(searchQuery.toLowerCase());

      // Category filter
      const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;

      // Location filter
      const matchesLocation = locationFilter === 'all' || item.location === locationFilter;

      // Status filter
      let matchesStatus = true;
      if (statusFilter === 'low-stock') {
        matchesStatus = item.is_low_stock === true;
      } else if (statusFilter === 'expiring') {
        if (item.expiration_date) {
          const expDate = new Date(item.expiration_date);
          const in30Days = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
          matchesStatus = expDate <= in30Days;
        } else {
          matchesStatus = false;
        }
      } else if (statusFilter === 'expired') {
        if (item.expiration_date) {
          const expDate = new Date(item.expiration_date);
          matchesStatus = expDate < new Date();
        } else {
          matchesStatus = false;
        }
      }

      return matchesSearch && matchesCategory && matchesLocation && matchesStatus;
    });
  }, [items, searchQuery, categoryFilter, locationFilter, statusFilter]);

  const handleItemAdded = (newItem: InventoryItem) => {
    setItems(prev => [newItem, ...prev]);
    setShowAddModal(false);
  };

  const handleItemUpdated = (updatedItem: InventoryItem) => {
    setItems(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item));
  };

  const handleItemDeleted = (itemId: string) => {
    setItems(prev => prev.filter(item => item.id !== itemId));
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 border rounded-lg bg-card">
        <Plus className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold">No inventory items yet</h3>
        <p className="text-sm text-muted-foreground mt-1 mb-4">
          Get started by adding your first item
        </p>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add First Item
        </Button>
        <AddItemModal
          open={showAddModal}
          onClose={() => setShowAddModal(false)}
          onItemAdded={handleItemAdded}
          existingCategories={categories.filter(c => c !== 'all')}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search inventory..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Filters */}
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="h-10 px-3 rounded-md border border-input bg-background text-sm"
        >
          <option value="all">All Categories</option>
          {categories
            .filter((c): c is string => c !== 'all' && typeof c === 'string')
            .map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
        </select>

        <select
          value={locationFilter}
          onChange={(e) => setLocationFilter(e.target.value)}
          className="h-10 px-3 rounded-md border border-input bg-background text-sm"
        >
          <option value="all">All Locations</option>
          {locations
            .filter((l): l is string => l !== 'all' && typeof l === 'string')
            .map(loc => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 px-3 rounded-md border border-input bg-background text-sm"
        >
          <option value="all">All Status</option>
          <option value="low-stock">Low Stock</option>
          <option value="expiring">Expiring Soon</option>
          <option value="expired">Expired</option>
        </select>

        {/* Add Item Button */}
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Item
        </Button>
      </div>

      {/* Results Count */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredItems.length} of {items.length} items
      </div>

      {/* Table */}
      {filteredItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 border rounded-lg bg-card">
          <Filter className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">No items match your filters</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Try adjusting your search or filter criteria
          </p>
        </div>
      ) : (
        <InventoryTable
          data={filteredItems}
          columns={inventoryColumns(handleItemUpdated, handleItemDeleted)}
        />
      )}

      {/* Add Item Modal */}
      <AddItemModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onItemAdded={handleItemAdded}
        existingCategories={[]}
      />
    </div>
  );
}
