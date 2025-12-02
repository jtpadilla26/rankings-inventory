import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

export async function GET() {
  // 1) Get categories from inventory_items
  const { data: itemRows, error: itemsError } = await supabase
    .from('inventory_items')
    .select('category');

  if (itemsError) {
    return NextResponse.json({ error: itemsError.message }, { status: 500 });
  }

  // 2) Get existing thresholds
  const { data: thresholdRows, error: thresholdsError } = await supabase
    .from('category_thresholds')
    .select('*');

  if (thresholdsError) {
    return NextResponse.json({ error: thresholdsError.message }, { status: 500 });
  }

  const thresholdMap = new Map<string, number | null>();
  (thresholdRows ?? []).forEach((row: any) => {
    thresholdMap.set(row.category, row.default_threshold);
  });

  // Distinct non-empty categories from items
  const categories = Array.from(
    new Set(
      (itemRows ?? [])
        .map((r: any) => r.category as string | null)
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

export async function POST(request: Request) {
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
    .upsert({ category, default_threshold: value }, { onConflict: 'category' });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
