import {
  createRouteHandlerClient,
  createServerComponentClient,
} from '@supabase/auth-helpers-nextjs';
import type { Session } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

function assertSupabaseEnv() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is not configured');
  }
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is not configured');
  }
}

export function createServerClient() {
  if (typeof window !== 'undefined') {
    throw new Error('createServerClient can only be used on the server');
  }

  assertSupabaseEnv();

  return createServerComponentClient({ cookies });
}

export function createRouteHandlerSupabaseClient() {
  assertSupabaseEnv();
  return createRouteHandlerClient({ cookies });
}

export async function getServerSession(): Promise<Session> {
  const supabase = createServerComponentClient({ cookies });
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    throw new Error(`Failed to read Supabase session: ${error.message}`);
  }

  if (!session) {
    throw new Error('Unauthorized');
  }

  return session;
}
