const API = process.env.NEXT_PUBLIC_API_URL || 'https://golden-neumorphism.emergent.host/api';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('sunrise_token');
}

export async function apiFetch<T = any>(
  path: string,
  opts: RequestInit = {},
  auth: boolean = true
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(opts.headers as Record<string, string>),
  };
  if (auth) {
    const t = getToken();
    if (t) headers['Authorization'] = `Bearer ${t}`;
  }
  const res = await fetch(`${API}${path}`, { ...opts, headers });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    if (res.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('sunrise_token');
      localStorage.removeItem('sunrise_user');
      window.location.href = '/login';
    }
    throw new Error(body || `HTTP ${res.status}`);
  }
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) return (await res.json()) as T;
  return (await res.text()) as unknown as T;
}

export const api = {
  get: <T = any>(p: string) => apiFetch<T>(p, { method: 'GET' }),
  post: <T = any>(p: string, body?: any) =>
    apiFetch<T>(p, { method: 'POST', body: body != null ? JSON.stringify(body) : undefined }),
  put: <T = any>(p: string, body?: any) =>
    apiFetch<T>(p, { method: 'PUT', body: body != null ? JSON.stringify(body) : undefined }),
  del: <T = any>(p: string) => apiFetch<T>(p, { method: 'DELETE' }),
};
