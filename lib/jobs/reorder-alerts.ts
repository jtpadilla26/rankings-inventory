// lib/jobs/reorder-alerts.ts
import { createServerClient } from '@/lib/supabase/server';

export async function checkReorderPoints() {
  const supabase = createServerClient();
  
  const { data: items } = await supabase
    .from('inventory_items')
    .select(`
      *,
      stock_levels (quantity),
      categories (name)
    `)
    .lt('stock_levels.quantity', 'reorder_point')
    .eq('is_active', true);
  
  if (items?.length) {
    // Send alerts via email/Slack
    await sendReorderAlerts(items);
  }
}
