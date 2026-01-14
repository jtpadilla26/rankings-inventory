import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

// GET: return one row per category that exists in inventory_items,
// merged with any saved thresholds in category_thresholds.
export async function GET() {
  const supabase = createServerClient();

  // 1) Get all categories in use in the inventory
  const { data: itemRows, error: itemsError } = await supabase
    .from('inventory_items_enriched')
    .select('category');

  if (itemsError) {
    return NextResponse.json({ error: itemsError.message }, { status: 500 });
  }

  // 2) Get existing category thresholds
  const { data: thresholdRows, error: thresholdsError } = await supabase
    .from('category_thresholds')
    .select('*');

  if (thresholdsError) {
    return NextResponse.json({ error: thresholdsError.message }, { status: 500 });
  }

  // Build a map: category -> default_threshold
  const thresholdMap = new Map<string, number | null>();
  (thresholdRows ?? []).forEach((row: any) => {
    thresholdMap.set(row.category, row.default_threshold);
  });

  // Distinct, non-empty categories
  const categories = Array.from(
    new Set(
      (itemRows ?? [])
        .map((r: any) => (r.category == null ? null : String(r.category)))
        .filter((c): c is string => !!c && c.trim().length > 0)
    )
  ).sort();

  const result = categories.map((category) => ({
    category,
    default_threshold: thresholdMap.has(category)
      ? (thresholdMap.get(category) as number | null)
      : null,
  }));

  return NextResponse.json(result);
}

// POST: upsert a single category threshold
export async function POST(request: Request) {
  const supabase = createServerClient();

  const body = await request.json().catch(() => ({} as any));
  const { category, default_threshold } = body as {
    category?: string;
    default_threshold?: number | null | string;
  };

  if (!category || typeof category !== 'string') {
    return NextResponse.json({ error: 'Category is required' }, { status: 400 });
  }

  let value: number | null = null;
  if (default_threshold !== null && default_threshold !== undefined && default_threshold !== '') {
    const n = Number(default_threshold);
    value = Number.isFinite(n) ? n : null;
  }

  const { error } = await supabase
    .from('category_thresholds')
    .upsert(
      { category, default_threshold: value },
      { onConflict: 'category' }
    );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
