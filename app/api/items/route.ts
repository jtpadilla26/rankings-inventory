// app/api/items/route.ts
import { NextResponse } from 'next/server';

import { createServerClient } from '@/lib/supabase/server';
import { sanitizeInventoryItem } from '@/lib/sanitizeInventoryItem';

function validateInventoryItemInput(data: ReturnType<typeof sanitizeInventoryItem>): string | null {
  if (!data.name) {
    return 'Name is required';
  }

  return null;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const sanitized = sanitizeInventoryItem(body);
    const validationError = validateInventoryItemInput(sanitized);

    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const { id: _ignore, ...payload } = sanitized;

    const supabase = createServerClient();
    const { data: inserted, error } = await supabase
      .from('inventory_items')
      .insert(payload)
      .select()
      .single();

    if (error || !inserted) {
      return NextResponse.json(
        { error: error?.message ?? 'Failed to create inventory item' },
        { status: 400 },
      );
    }

    return NextResponse.json(inserted, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
