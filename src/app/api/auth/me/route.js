export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
import { query } from '@/lib/db';
import { verifyToken, getTokenFromRequest } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const token = getTokenFromRequest(request);
    if (!token) return NextResponse.json({ user: null });

    const payload = verifyToken(token);
    if (!payload) return NextResponse.json({ user: null });

    const result = await query(
      'SELECT id, name, email, is_admin FROM users WHERE id = $1',
      [payload.userId]
    );
    
    if (result.rows.length === 0) return NextResponse.json({ user: null });
    const u = result.rows[0];
    return NextResponse.json({ 
      user: { id: u.id, name: u.name, email: u.email, isAdmin: u.is_admin } 
    });
  } catch {
    return NextResponse.json({ user: null });
  }
}
