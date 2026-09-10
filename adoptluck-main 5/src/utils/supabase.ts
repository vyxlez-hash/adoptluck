/**
 * Small Supabase REST client. We intentionally do not ship a service-role key.
 * Configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in the deployment.
 */
const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL || '').replace(/\/$/, '');
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

function headers(extra: Record<string, string> = {}) {
  return {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json',
    ...extra,
  };
}

export async function supabaseRest<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  if (!supabaseConfigured) throw new Error('Supabase is not configured');
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...options,
    headers: headers((options.headers || {}) as Record<string, string>),
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Supabase ${response.status}: ${text || response.statusText}`);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export async function supabaseUpsert<T = any>(table: string, rows: T | T[]): Promise<T[]> {
  return supabaseRest<T[]>(table, {
    method: 'POST',
    headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
    body: JSON.stringify(rows),
  });
}

export async function supabasePatch<T = any>(
  table: string,
  filter: string,
  patch: Partial<T>
): Promise<T[]> {
  return supabaseRest<T[]>(`${table}?${filter}`, {
    method: 'PATCH',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify(patch),
  });
}

export async function supabaseDelete(table: string, filter: string): Promise<void> {
  await supabaseRest(`${table}?${filter}`, { method: 'DELETE' });
}
