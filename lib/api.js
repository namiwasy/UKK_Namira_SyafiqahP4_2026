'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const BASE = process.env.NEXT_PUBLIC_API || 'http://localhost:5000/api';
export const getSession = () => { try { return JSON.parse(localStorage.getItem('s')); } catch { return null; } };
export const setSession = v => localStorage.setItem('s', JSON.stringify(v));
export const clearSession = () => localStorage.removeItem('s');

export async function api(method, path, body) {
  const s = getSession();
  let r;
  try {
    r = await fetch(BASE + path, {
      method, headers: { 'Content-Type': 'application/json', ...(s ? { Authorization: 'Bearer ' + s.token } : {}) },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch { throw new Error('Backend belum berjalan di ' + BASE); }
  const d = await r.json().catch(() => ({}));
  if (!r.ok) {
    if (r.status === 401 && s) { clearSession(); location.href = '/'; }
    throw new Error(d.error || 'Terjadi kesalahan');
  }
  return d;
}

// Penjaga halaman: kembali ke beranda jika belum login / peran tidak cocok
export function useGuard(role) {
  const router = useRouter();
  const [s, setS] = useState(null);
  useEffect(() => {
    const x = getSession();
    if (!x || x.user.role !== role) router.replace('/'); else setS(x);
  }, []);
  return [s, () => { clearSession(); router.replace('/'); }];
}
