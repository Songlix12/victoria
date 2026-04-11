// Client-side token manager
// Stores JWT in localStorage and sends it as Authorization: Bearer header
// This bypasses all cookie issues on Vercel/CDN environments

const KEY = 'victoria_jwt';

export function saveToken(token) {
  try { localStorage.setItem(KEY, token); } catch {}
}

export function loadToken() {
  try { return localStorage.getItem(KEY) || null; } catch { return null; }
}

export function clearToken() {
  try { localStorage.removeItem(KEY); } catch {}
}

// Drop-in replacement for fetch() that automatically adds Authorization header
export function authFetch(url, options = {}) {
  const token = loadToken();
  const headers = {
    ...(options.headers || {}),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return fetch(url, {
    ...options,
    credentials: 'include',
    headers,
  });
}
