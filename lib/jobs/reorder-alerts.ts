// app/api/checkout/route.ts
import { NextResponse } from 'next/server';

// Temporary stub for checkout API to avoid Supabase env issues during build.
// This keeps the app deployable while you finish wiring Supabase config.
export async function POST(req: Request) {
  return NextResponse.json(
    {
      ok: false,
      error: 'Checkout API is not yet configured in this environment.',
    },
    { status: 501 }
  );
}

// Optional: handle GET too so hitting /api/checkout in the browser doesn’t error
export async function GET(req: Request) {
  return NextResponse.json(
    {
      ok: false,
      error: 'Checkout API is not yet configured in this environment.',
    },
    { status: 501 }
  );
}
