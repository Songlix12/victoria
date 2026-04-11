export const runtime = 'nodejs';
import { query } from '@/lib/db';
import { verifyToken, getTokenFromRequest } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  try {
    const result = await query(`
      SELECT c.id, c.content, c.created_at, u.name AS user_name
      FROM comments c
      JOIN users u ON u.id = c.user_id
      WHERE c.poem_id = $1
      ORDER BY c.created_at ASC
    `, [params.id]);

    return NextResponse.json({ comments: result.rows });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  try {
    const token = getTokenFromRequest(request);
    if (!token) return NextResponse.json({ error: 'Inicia sesión para comentar' }, { status: 401 });

    const payload = verifyToken(token);
    if (!payload) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const { content } = await request.json();
    if (!content?.trim()) {
      return NextResponse.json({ error: 'El comentario no puede estar vacío' }, { status: 400 });
    }

    const result = await query(
      'INSERT INTO comments (poem_id, user_id, content) VALUES ($1, $2, $3) RETURNING id, content, created_at',
      [params.id, payload.userId, content.trim()]
    );

    return NextResponse.json({
      comment: { ...result.rows[0], user_name: payload.name }
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
