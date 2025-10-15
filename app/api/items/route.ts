import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sanitizeItemInput } from "@/lib/sanitizeItem";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL!;
const key =
  process.env.SUPABASE_SERVICE_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY!;

const supabase = createClient(url, key);

export async function POST(req: Request) {
  const body = await req.json();
  const data = sanitizeItemInput(body); // strips total_value; "" price -> null

  if (!data.name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const { error, data: inserted } = await supabase
    .from("inventory_items")     // <-- your real table
    .insert(data)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(inserted, { status: 201 });
}
