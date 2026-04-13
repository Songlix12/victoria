export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

import { query } from '@/lib/db';
import { verifyToken, getTokenFromRequest } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function PUT(request, { params }) {
  try {
    const token = getTokenFromRequest(request);
    const payload = token ? verifyToken(token) : null;
    if (!payload?.userId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const userResult = await query('SELECT is_admin FROM users WHERE id = $1', [payload.userId]);
    if (!userResult.rows[0]?.is_admin) return NextResponse.json({ error: 'Solo admins' }, { status: 403 });

    const { title, content } = await request.json();
    if (!title?.trim() || !content?.trim())
      return NextResponse.json({ error: 'Título y contenido requeridos' }, { status: 400 });

    const result = await query(
      'UPDATE poems SET title = $1, content = $2 WHERE id = $3 RETURNING *',
      [title.trim(), content.trim(), params.id]
    );
    if (result.rows.length === 0)
      return NextResponse.json({ error: 'Carta no encontrada' }, { status: 404 });

    return NextResponse.json({ poem: result.rows[0] });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
