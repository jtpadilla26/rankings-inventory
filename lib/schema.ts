import { z } from 'zod';

export const toNumber = (v: unknown) => {
  if (typeof v === 'number') return v;
  if (typeof v === 'string') {
    const cleaned = v.replace(/[^\d.\-]/g, ''); // strip £ and commas
    const n = Number(cleaned);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
};

export const InventoryItemSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  category: z.string().optional().nullable(),
  units: z.union([z.number(), z.string()])
    .transform(toNumber)
    .pipe(z.number().min(0)),
  unit_type: z.string().optional().nullable(),
  price_per_unit: z.union([z.number(), z.string()])
    .transform(toNumber)
    .pipe(z.number().min(0)),
  location: z.string().optional().nullable(),
  date_added: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  expiration_date: z.string().optional().nullable(),
  batch_lot: z.string().optional().nullable(),
  opened_at: z.string().optional().nullable(),
  msds_url: z.string().url().optional().nullable(),
});
