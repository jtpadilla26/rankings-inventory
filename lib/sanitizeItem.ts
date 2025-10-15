// lib/sanitizeItem.ts
export type ItemUpsert = {
  id?: string;
  name: string;
  category_id?: string | null;
  item_type?: "consumable" | "asset" | null;
  unit?: string | null;
  unit_cost?: number | null;
  reorder_point?: number | null;
  par_level?: number | null;
  default_location_id?: string | null;
  supplier_id?: string | null;
  sku?: string | null;
  description?: string | null;
  is_active?: boolean | null;
  // NOTE: we deliberately do NOT include total_value here
};

export function sanitizeItemInput(input: Record<string, any>): ItemUpsert {
  const n = (v: any) =>
    v === "" || v === null || v === undefined ? null : Number(v);

  const s = (v: any) =>
    v === "" || v === null || v === undefined ? null : String(v);

  // strip display-only / computed fields
  const { total_value: _ignore, qty_on_hand: _qoh, ...rest } = input ?? {};

  return {
    id: s(rest.id) ?? undefined,
    name: String(rest.name ?? "").trim(),
    category_id: s(rest.category_id),
    item_type: (rest.item_type ?? null) as "consumable" | "asset" | null,
    unit: s(rest.unit),
    unit_cost: n(rest.unit_cost),                // "" => null (OK)
    reorder_point: n(rest.reorder_point),
    par_level: n(rest.par_level),
    default_location_id: s(rest.default_location_id),
    supplier_id: s(rest.supplier_id),
    sku: s(rest.sku),
    description: s(rest.description),
    is_active: rest.is_active ?? true,
  };
}
