import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

export async function GET() {
  const { data, error } = await supabase
    .from('category_thresholds')
    .select('*')
    .order('category', { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const body = await req.json(); // { category: string, default_threshold: number|null }
  const { category, default_threshold } = body ?? {};
  if (!category) return NextResponse.json({ error: 'category required' }, { status: 400 });

  const { error } = await supabase
    .from('category_thresholds')
    .upsert({ category, default_threshold }, { onConflict: 'category' });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
