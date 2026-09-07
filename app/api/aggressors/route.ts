import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { sql } from '@/lib/db';
import type { Aggressor } from '@/lib/types';

export async function GET() {
  const session = await auth();
  const userId = (session?.user as { id?: string })?.id;
  if (!userId) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  try {
    const aggressors = await sql`
      SELECT * FROM aggressors WHERE user_id = ${userId} ORDER BY name ASC
    ` as Aggressor[];
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
