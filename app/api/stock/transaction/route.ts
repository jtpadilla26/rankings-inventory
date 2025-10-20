// app/api/stock/transaction/route.ts
export async function POST(req: Request) {
  const session = await getServerSession();
  const limiter = rateLimit({ limit: 100 });
  
  if (!limiter.check(session.user.id).success) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }
  
  const body = await req.json();
  const supabase = createServerClient();
  
  // Start transaction
  const { data: transaction, error: txError } = await supabase
    .from('stock_transactions')
    .insert({
      item_id: body.item_id,
      transaction_type: body.type,
      quantity: body.quantity,
      unit_cost: body.unit_cost,
      location_id: body.location_id,
      user_id: session.user.id,
      notes: body.notes,
      reference_id: body.reference_id,
    })
    .select()
    .single();
    
  if (txError) {
    return NextResponse.json({ error: txError.message }, { status: 400 });
  }
  
  // Update current stock level
  const { error: stockError } = await supabase.rpc('update_stock_level', {
    p_item_id: body.item_id,
    p_location_id: body.location_id,
    p_quantity: body.type === 'out' ? -body.quantity : body.quantity,
  });
  
  if (stockError) {
    // Rollback transaction
    await supabase.from('stock_transactions').delete().eq('id', transaction.id);
    return NextResponse.json({ error: 'Failed to update stock' }, { status: 500 });
  }
  
  return NextResponse.json(transaction);
}
