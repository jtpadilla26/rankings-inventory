export const runtime = "nodejs";
export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import XlsxPopulate from "xlsx-populate";
import { readFile } from "fs/promises";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = createRouteHandlerSupabaseClient();
  try {
    const buf = await readFile(process.cwd() + "/public/templates/items_template.xlsx");
    const wb = await XlsxPopulate.fromDataAsync(buf);

    // Extract unique categories from inventory items
    const { data: items, error } = await supabase
      .from("inventory_items_enriched")
      .select("category")
      .order("category", { ascending: true });

    if (error) {
      console.error("Error fetching categories:", error);
      // Continue without categories if there's an error
    }

    // Extract unique, non-null categories
    const uniqueCategories = Array.from(
      new Set(
        (items ?? [])
          .map((item) => item.category)
          .filter((cat): cat is string => cat != null && cat !== '')
      )
    ).sort();

    // write into hidden Lists sheet (A2:A…)
    const lists = wb.sheet("Lists");
    lists.range("A2:A10000").clear();
    uniqueCategories.forEach((cat, i) => lists.cell(2 + i, 1).value(cat));

    const out = await wb.outputAsync();
    return new NextResponse(out, {
      headers: {
        "Content-Type":"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition":"attachment; filename=rankins-items.xlsx"
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "export failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
