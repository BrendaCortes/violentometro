import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

async function getOwnerId(): Promise<string | null> {
  const email = process.env.OWNER_EMAIL;
  if (!email) return null;
  const rows = await sql`SELECT id FROM users WHERE email = ${email} LIMIT 1` as { id: string }[];
  return rows[0]?.id ?? null;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const yearParam = searchParams.get('year');
  const year = yearParam ? Number(yearParam) : new Date().getFullYear();

  if (!Number.isInteger(year) || year < 2000 || year > 2100) {
    return NextResponse.json({ error: 'Año inválido' }, { status: 400 });
  }

  try {
    const ownerId = await getOwnerId();
    if (!ownerId) {
      return NextResponse.json({ year, data: [] });
    }

    const start = `${year}-01-01T00:00:00Z`;
    const end = `${year}-12-31T23:59:59.999Z`;

    const rows = await sql`
      SELECT
        a.id AS aggressor_id,
        a.name,
        COUNT(s.id)::int AS incidents,
        COALESCE(SUM(s.severity), 0)::int AS total_severity,
        COALESCE(AVG(s.severity), 0)::float AS avg_severity
      FROM aggressors a
      LEFT JOIN situations s
        ON s.aggressor_id = a.id
        AND s.user_id = ${ownerId}
        AND s.created_at >= ${start}
        AND s.created_at <= ${end}
      WHERE a.user_id = ${ownerId}
      GROUP BY a.id, a.name
      HAVING COUNT(s.id) > 0
      ORDER BY total_severity DESC, incidents DESC
    ` as Array<{
      aggressor_id: string;
      name: string;
      incidents: number;
      total_severity: number;
      avg_severity: number;
    }>;

    return NextResponse.json({ year, data: rows });
  } catch (err) {
    console.error('Error fetching rewind:', err);
    return NextResponse.json({ error: 'Error al obtener rewind' }, { status: 500 });
  }
}
