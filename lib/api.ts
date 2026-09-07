/**
 * API client for Violentómetro.
 * Calls our Next.js API routes which handle auth + database access.
 */

import type { Situation, Aggressor, AggressionType } from '@/lib/types';

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ data: T | null; error: string | null }> {
  try {
    const res = await fetch(endpoint, {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options,
    });
    const json = await res.json();
    if (!res.ok) {
      return { data: null, error: json.error ?? 'Error desconocido' };
    }
    return { data: json.data ?? json, error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : 'Error de red' };
  }
}

// ─── Situations ───────────────────────────────────────────────────────────────

export async function getSituations(aggressorId?: string): Promise<{ data: Situation[] | null; error: string | null }> {
  const url = aggressorId ? `/api/situations?aggressor_id=${aggressorId}` : '/api/situations';
  return fetchApi<Situation[]>(url);
}

export async function createSituation(input: {
  aggressor_id: string | null;
  aggression_type: AggressionType;
  severity: number;
  description?: string | null;
}): Promise<{ data: Situation | null; error: string | null }> {
  return fetchApi<Situation>('/api/situations', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function deleteSituation(id: string): Promise<{ error: string | null }> {
  const result = await fetchApi<{ success: boolean }>(`/api/situations?id=${id}`, {
    method: 'DELETE',
  });
  return { error: result.error };
}

// ─── Aggressors ───────────────────────────────────────────────────────────────

export async function getAggressors(weekStart?: string): Promise<{ data: Aggressor[] | null; error: string | null }> {
  const qs = weekStart ? `?week_start=${encodeURIComponent(weekStart)}` : '';
  return fetchApi<Aggressor[]>(`/api/aggressors${qs}`);
}

export async function createAggressor(name: string): Promise<{ data: Aggressor | null; error: string | null }> {
  return fetchApi<Aggressor>('/api/aggressors', {
    method: 'POST',
    body: JSON.stringify({ name }),
  });
}

// ─── Rewind ────────────────────────────────────────────────────────────────────

export interface RewindEntry {
  aggressor_id: string;
  name: string;
  incidents: number;
  total_severity: number;
  avg_severity: number;
}

export async function getRewind(year?: number): Promise<{ data: RewindEntry[] | null; error: string | null }> {
  const qs = year ? `?year=${year}` : '';
  return fetchApi<RewindEntry[]>(`/api/rewind${qs}`);
}
