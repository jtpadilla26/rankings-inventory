// lib/types/database.ts
export interface InventoryItem {
  id: string;
  name: string;
  category_id: string | null;
  item_type: 'consumable' | 'asset' | null;
  unit: string | null;
  price_per_unit: number | null;
  reorder_point: number | null;
  par_level: number | null;
  default_location_id: string | null;
  supplier_id: string | null;
  sku: string | null;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface StockTransaction {
  id: string;
  item_id: string;
  transaction_type: 'in' | 'out' | 'adjustment' | 'count';
  quantity: number;
  unit_cost: number | null;
  location_id: string | null;
  user_id: string;
  notes: string | null;
  reference_id: string | null; // PO#, checkout#, etc
  created_at: string;
}
