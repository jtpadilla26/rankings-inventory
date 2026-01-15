import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

// GET: return all categories sorted by name
export async function GET() {
  const supabase = createServerClient();

  const { data: categories, error } = await supabase
    .from('categories')
    .select('id, name')
    .order('name', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(categories ?? []);
}

// POST: create a new category
export async function POST(request: Request) {
  const supabase = createServerClient();

  const body = await request.json().catch(() => ({} as any));
  const { name } = body as { name?: string };

  if (!name || typeof name !== 'string' || !name.trim()) {
    return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
  }

  const trimmedName = name.trim();

  const { data, error } = await supabase
    .from('categories')
    .insert({ name: trimmedName })
    .select()
    .single();

  if (error) {
    // Handle unique constraint violation
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Category already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
