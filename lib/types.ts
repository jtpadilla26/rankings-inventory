export type InventoryItem = {
  id: string;
  name: string;
  category: string | null;
  units: number;               // numeric(12,3)
  unit_type: string | null;
  price_per_unit: number;      // numeric(12,2)
  total_value?: number | null; // generated column
  location: string | null;
  date_added: string | null;
  notes: string | null;
  inserted_at: string | null;
  updated_at: string | null;
  expiration_date: string | null;
  batch_lot: string | null;
  opened_at: string | null;
  msds_url: string | null;
};

export type InventorySummary = {
  total_inventory_value: number; // numeric(14,2)
  total_items: number;           // int
  total_units: number;           // numeric(14,3)
};
