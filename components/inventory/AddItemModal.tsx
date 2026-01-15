'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { InventoryItem } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import CategorySelect from './CategorySelect';

type Props = {
  open: boolean;
  onClose: () => void;
  onItemAdded: (item: InventoryItem) => void;
  existingCategories?: string[];
};

const getStringOrNull = (value: FormDataEntryValue | null) => {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
};

const getSupabaseErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof Error) {
    const details = (error as { details?: string }).details;
    return details ? `${error.message} (${details})` : error.message;
  }
  return fallback;
};

export function AddItemModal({ open, onClose, onItemAdded, existingCategories = [] }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: (formData.get('name') as string).trim(),
      category: getStringOrNull(formData.get('category')),
      units: Number(formData.get('units')) || 0,
      unit_type: getStringOrNull(formData.get('unit_type')),
      price_per_unit: Number(formData.get('price_per_unit')) || 0,
      location: getStringOrNull(formData.get('location')),
      date_added:
        getStringOrNull(formData.get('date_added')) ??
        new Date().toISOString().split('T')[0],
      notes: getStringOrNull(formData.get('notes')),
      expiration_date: getStringOrNull(formData.get('expiration_date')),
      batch_lot: getStringOrNull(formData.get('batch_lot')),
      opened_at: getStringOrNull(formData.get('opened_at')),
      msds_url: getStringOrNull(formData.get('msds_url')),
      low_stock_threshold: formData.get('low_stock_threshold') ? Number(formData.get('low_stock_threshold')) : null,
    };

    // Validation
    if (!data.name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Item name is required',
      });
      setIsSubmitting(false);
      return;
    }

    if (data.units < 0) {
      toast({
        title: 'Validation Error',
        description: 'Units cannot be negative',
      });
      setIsSubmitting(false);
      return;
    }

    if (data.price_per_unit < 0) {
      toast({
        title: 'Validation Error',
        description: 'Price cannot be negative',
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const { data: newItem, error } = await supabase
        .from('inventory_items')
        .insert([data])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Item added successfully',
      });

      onItemAdded(newItem as InventoryItem);
      router.refresh();
    } catch (error) {
      console.error('Error adding item:', { error, payload: data });
      toast({
        title: 'Error',
        description: getSupabaseErrorMessage(error, 'Failed to add item'),
      console.error('Error adding item:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to add item',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Item</DialogTitle>
          <DialogDescription>
            Add a new item to your inventory. Fields marked with * are required.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Name */}
            <div className="col-span-2">
              <Label htmlFor="name">Item Name *</Label>
              <Input
                id="name"
                name="name"
                placeholder="e.g., Nitrogen Fertilizer"
                required
                disabled={isSubmitting}
              />
            </div>

            {/* Category */}
            <div>
              <Label htmlFor="category">Category</Label>
              <CategorySelect
                name="category"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                required={false}
              />
            </div>

            {/* Location */}
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                name="location"
                placeholder="e.g., Storage Room A"
                disabled={isSubmitting}
              />
            </div>

            {/* Units */}
            <div>
              <Label htmlFor="units">Units/Quantity *</Label>
              <Input
                id="units"
                name="units"
                type="number"
                min="0"
                step="0.01"
                defaultValue="0"
                required
                disabled={isSubmitting}
              />
            </div>

            {/* Unit Type */}
            <div>
              <Label htmlFor="unit_type">Unit Type</Label>
              <select
                id="unit_type"
                name="unit_type"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                disabled={isSubmitting}
              >
                <option value="">Select type</option>
                <option value="consumable">Consumable</option>
                <option value="asset">Asset</option>
              </select>
            </div>

            {/* Price */}
            <div>
              <Label htmlFor="price_per_unit">Price per Unit *</Label>
              <Input
                id="price_per_unit"
                name="price_per_unit"
                type="number"
                min="0"
                step="0.01"
                defaultValue="0"
                required
                disabled={isSubmitting}
              />
            </div>

            {/* Low Stock Threshold */}
            <div>
              <Label htmlFor="low_stock_threshold">Low Stock Threshold</Label>
              <Input
                id="low_stock_threshold"
                name="low_stock_threshold"
                type="number"
                min="0"
                step="1"
                placeholder="Optional"
                disabled={isSubmitting}
              />
            </div>

            {/* Batch/Lot */}
            <div>
              <Label htmlFor="batch_lot">Batch / Lot Number</Label>
              <Input
                id="batch_lot"
                name="batch_lot"
                placeholder="e.g., LOT-2024-001"
                disabled={isSubmitting}
              />
            </div>

            {/* Date Added */}
            <div>
              <Label htmlFor="date_added">Date Added</Label>
              <Input
                id="date_added"
                name="date_added"
                type="date"
                defaultValue={new Date().toISOString().split('T')[0]}
                disabled={isSubmitting}
              />
            </div>

            {/* Expiration Date */}
            <div>
              <Label htmlFor="expiration_date">Expiration Date</Label>
              <Input
                id="expiration_date"
                name="expiration_date"
                type="date"
                disabled={isSubmitting}
              />
            </div>

            {/* Opened At */}
            <div>
              <Label htmlFor="opened_at">Opened Date</Label>
              <Input
                id="opened_at"
                name="opened_at"
                type="date"
                disabled={isSubmitting}
              />
            </div>

            {/* MSDS URL */}
            <div className="col-span-2">
              <Label htmlFor="msds_url">MSDS URL</Label>
              <Input
                id="msds_url"
                name="msds_url"
                type="url"
                placeholder="https://..."
                disabled={isSubmitting}
              />
            </div>

            {/* Notes */}
            <div className="col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <textarea
                id="notes"
                name="notes"
                rows={3}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Additional notes..."
                disabled={isSubmitting}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Item
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
