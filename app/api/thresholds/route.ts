import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = createServerClient();

  // 1) Get categories from inventory_items
  const { data: itemRows, error: itemsError } = await supabase
    .from('inventory_items')
    .select('category')
    .order('category', { ascending: true });

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

  // Distinct non-null, non-empty categories
  const categories = Array.from(
    new Set(
      (itemRows ?? [])
        .map((row: any) => row.category as string | null)
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
  const supabase = createServerClient();
  const body = await request.json().catch(() => ({} as any));
  const { category, default_threshold } = body as {
    category?: string;
    default_threshold?: number | null;
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
