// app/api/items/[id]/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sanitizeItemInput } from "@/lib/sanitizeItem";

const url =
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL!;
const key =
  process.env.SUPABASE_SERVICE_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY!;

const supabase = createClient(url, key);

export async function PUT(_req: Request, ctx: { params: { id: string } }) {
  const id = ctx.params.id;
  const body = await _req.json();
  const { id: _strip, ...data } = sanitizeItemInput({ ...body, id }); // strip `id` from update payload

  const { error, data: updated } = await supabase.from("items").update(data).eq("id", id).select().single();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json(updated, { status: 200 });
}
