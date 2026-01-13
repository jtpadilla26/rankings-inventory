// lib/importers/items.ts
import * as XLSX from "xlsx";
import { sanitizeInventoryItem } from "@/lib/sanitizeInventoryItem";
import { supabase } from "@/lib/supabase/client";

// Helpers: case-insensitive maps
const norm = (s?: string) => (s ?? "").trim().replace(/\s+/g, " ");
const normCI = (s?: string) => norm(s).toLowerCase();

// Parse a File (xlsx OR csv) into rows
export async function parseFile(file: File) {
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: "array" });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<any>(sheet, { defval: "" });
  return rows;
}

/**
 * Map rows → inventory_items payload, ignore total_value, allow blank price (becomes null).
 *
 * Expected column headers from your template/sheets:
 * name, category, units, unit_type, price_per_unit, total_value (ignored), location, date_added, notes,
 * expiration_date, batch_lot, opened_at, msds_url, low_stock_threshold
 */
export async function buildPayload(rows: any[]) {
  const payload = [];
  const errors: string[] = [];

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];

    // Validate required fields
    if (!r.name || String(r.name).trim() === '') {
      errors.push(`Row ${i + 2}: Name is required`);
      continue;
    }

    const item = sanitizeInventoryItem({
      name: r.name,
      category: r.category || null,
      units: r.units || null,
      unit_type: r.unit_type || null,
      price_per_unit: r.price_per_unit || null,
      location: r.location || null,
      date_added: r.date_added || null,
      notes: r.notes || null,
      expiration_date: r.expiration_date || null,
      batch_lot: r.batch_lot || null,
      opened_at: r.opened_at || null,
      msds_url: r.msds_url || null,
      low_stock_threshold: r.low_stock_threshold || null,
      // IMPORTANT: we do NOT pass total_value here - it's stripped by sanitizer
    });

    payload.push(item);
  }

  return { payload, errors };
}

/** Insert items into inventory_items table */
export async function upsertItems(payload: any[]) {
  if (!payload.length) return { error: null, count: 0 };
  // Use insert instead of upsert to avoid conflicts with generated columns
  const { error, count } = await supabase
    .from("inventory_items")
    .insert(payload);
  return { error, count: count ?? payload.length };
}
