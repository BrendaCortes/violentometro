import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { sql } from '@/lib/db';
import type { Aggressor } from '@/lib/types';

async function getOwnerId(): Promise<string | null> {
  const email = process.env.OWNER_EMAIL;
  if (!email) return null;
  const rows = await sql`SELECT id FROM users WHERE email = ${email} LIMIT 1` as { id: string }[];
  return rows[0]?.id ?? null;
}

function getCurrentWeekStart(): Date {
  const d = new Date();
  const day = d.getUTCDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  d.setUTCDate(d.getUTCDate() + diffToMonday);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const weekStartParam = searchParams.get('week_start');

  let weekStart: Date;
  if (weekStartParam) {
    weekStart = new Date(weekStartParam);
    if (isNaN(weekStart.getTime())) {
      return NextResponse.json({ error: 'week_start inválido' }, { status: 400 });
    }
  } else {
    weekStart = getCurrentWeekStart();
  }

  const weekEnd = new Date(weekStart);
  weekEnd.setUTCDate(weekStart.getUTCDate() + 6);
  weekEnd.setUTCHours(23, 59, 59, 999);

  try {
    const ownerId = await getOwnerId();
    if (!ownerId) {
      return NextResponse.json({ data: [] });
    }

    const aggressors = await sql`
      SELECT
        a.id,
        a.user_id,
        a.name,
        a.created_at,
        GREATEST(0, 100 - 3 * COALESCE(SUM(CASE
          WHEN s.created_at >= ${weekStart.toISOString()}::timestamptz
          AND s.created_at <= ${weekEnd.toISOString()}::timestamptz
          THEN s.severity
          ELSE 0
        END), 0))::int AS brendapoints,
        COALESCE(SUM(CASE
          WHEN s.created_at >= ${weekStart.toISOString()}::timestamptz
          AND s.created_at <= ${weekEnd.toISOString()}::timestamptz
          THEN s.severity
          ELSE 0
        END), 0)::int AS weekly_severity
      FROM aggressors a
      LEFT JOIN situations s
        ON s.aggressor_id = a.id
        AND s.user_id = ${ownerId}
      WHERE a.user_id = ${ownerId}
      GROUP BY a.id, a.user_id, a.name, a.created_at
      ORDER BY brendapoints ASC, weekly_severity DESC, a.name ASC
    ` as Array<Aggressor & { weekly_severity: number }>;

    return NextResponse.json({ data: aggressors });
  } catch (err) {
    console.error('Error fetching aggressors:', err);
    return NextResponse.json({ error: 'Error al obtener personas' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await auth();
  const userId = (session?.user as { id?: string })?.id;
  if (!userId) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  try {
    const { name } = await request.json();
    if (!name?.trim()) {
      return NextResponse.json({ error: 'Nombre requerido' }, { status: 400 });
    }

    const result = await sql`
      INSERT INTO aggressors (user_id, name)
      VALUES (${userId}, ${name.trim()})
      RETURNING *
    ` as Aggressor[];

    return NextResponse.json({ data: result[0] }, { status: 201 });
  } catch (err) {
    console.error('Error creating aggressor:', err);
    return NextResponse.json({ error: 'Error al crear persona' }, { status: 500 });
  }
}
