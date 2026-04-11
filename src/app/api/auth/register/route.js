export const runtime = 'nodejs';
import { query } from '@/lib/db';
import { signToken } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { name, email, password } = await request.json();

    if (!name?.trim() || !email?.trim() || !password) {
      return NextResponse.json({ error: 'Todos los campos son requeridos' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'La contraseña debe tener al menos 6 caracteres' }, { status: 400 });
    }

    const existing = await query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (existing.rows.length > 0) {
      return NextResponse.json({ error: 'Este correo ya está registrado' }, { status: 400 });
    }

    const password_hash = await bcrypt.hash(password, 12);
    const adminEmail = (process.env.ADMIN_EMAIL || '').toLowerCase();
    const isAdmin = email.toLowerCase() === adminEmail;

    const result = await query(
      'INSERT INTO users (name, email, password_hash, is_admin) VALUES ($1, $2, $3, $4) RETURNING id, name, email, is_admin',
      [name.trim(), email.toLowerCase(), password_hash, isAdmin]
    );

    const user = result.rows[0];
    const token = signToken({ 
      userId: user.id, 
      email: user.email, 
      isAdmin: user.is_admin, 
      name: user.name 
    });

    const response = NextResponse.json({
      success: true,
      user: { id: user.id, name: user.name, email: user.email, isAdmin: user.is_admin }
    });

    response.cookies.set('victoria_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/'
    });

    return response;
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json({ error: 'Error al crear la cuenta' }, { status: 500 });
  }
}
