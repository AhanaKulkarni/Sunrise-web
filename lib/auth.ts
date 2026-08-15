'use client';
import { useEffect, useState } from 'react';

export type User = {
  id: string;
  name: string;
  phone: string;
  role: string;
  is_super_admin?: boolean;
  department?: string;
  designation?: string;
};

export function getUser(): User | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('sunrise_user');
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

export function setSession(token: string, user: User) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('sunrise_token', token);
  localStorage.setItem('sunrise_user', JSON.stringify(user));
}

export function clearSession() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('sunrise_token');
  localStorage.removeItem('sunrise_user');
}

export function useUser(): User | null {
  const [u, setU] = useState<User | null>(null);
  useEffect(() => {
    setU(getUser());
  }, []);
  return u;
}
