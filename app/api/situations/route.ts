import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { sql } from '@/lib/db';
import type { Situation } from '@/lib/types';

async function getOwnerId(): Promise<string | null> {
  const email = process.env.OWNER_EMAIL;
  if (!email) return null;
  const rows = await sql`SELECT id FROM users WHERE email = ${email} LIMIT 1` as { id: string }[];
  return rows[0]?.id ?? null;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const aggressorId = searchParams.get('aggressor_id');

  try {
    const ownerId = await getOwnerId();
    if (!ownerId) {
      return NextResponse.json({ data: [] });
    }

    let situations: Situation[];

    if (aggressorId) {
      situations = await sql`
        SELECT * FROM situations
        WHERE user_id = ${ownerId} AND aggressor_id = ${aggressorId}
        ORDER BY created_at ASC
      ` as Situation[];
    } else {
      situations = await sql`
        SELECT * FROM situations
        WHERE user_id = ${ownerId}
        ORDER BY created_at ASC
      ` as Situation[];
    }

    return NextResponse.json({ data: situations });
  } catch (err) {
    console.error('Error fetching situations:', err);
    return NextResponse.json({ error: 'Error al obtener situaciones' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await auth();
  const userId = (session?.user as { id?: string })?.id;
  if (!userId) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  try {
    const { aggressor_id, aggression_type, severity, description } = await request.json();

    if (!aggression_type || !severity) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 });
    }

    const result = await sql`
      INSERT INTO situations (user_id, aggressor_id, aggression_type, severity, description)
      VALUES (${userId}, ${aggressor_id ?? null}, ${aggression_type}, ${severity}, ${description ?? null})
      RETURNING *
    ` as Situation[];

    return NextResponse.json({ data: result[0] }, { status: 201 });
  } catch (err) {
    console.error('Error creating situation:', err);
    return NextResponse.json({ error: 'Error al crear situación' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await auth();
  const userId = (session?.user as { id?: string })?.id;
  if (!userId) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
  }

  try {
    await sql`DELETE FROM situations WHERE id = ${id} AND user_id = ${userId}`;
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error deleting situation:', err);
    return NextResponse.json({ error: 'Error al eliminar' }, { status: 500 });
  }
}
