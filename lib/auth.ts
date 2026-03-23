export interface TokenPayload {
  id: string;
  role: 'rider' | 'owner' | 'admin';
  iat: number;
  exp: number;
}

export function getUserFromToken(token: string): TokenPayload | null {
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload));
    if (decoded.exp * 1000 < Date.now()) {
      localStorage.removeItem('token');
      return null;
    }
    return decoded;
  } catch {
    return null;
  }
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

export function isAuthenticated(): boolean {
  const token = getToken();
  if (!token) return false;
  return getUserFromToken(token) !== null;
}

export function requireAuth(): TokenPayload | null {
  const token = getToken();
  if (!token) return null;
  return getUserFromToken(token);
}