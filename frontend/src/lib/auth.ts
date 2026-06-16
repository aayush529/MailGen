const ACCESS_TOKEN_KEY = 'access_token';

type JwtPayload = {
  exp?: number;
};

function decodePayload(token: string): JwtPayload | null {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;

    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(window.atob(base64)) as JwtPayload;
  } catch {
    return null;
  }
}

export function saveAccessToken(token: string) {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function clearAccessToken() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
}

export function hasValidSession() {
  const token = getAccessToken();
  if (!token) return false;

  const payload = decodePayload(token);
  if (!payload?.exp) return true;

  const isValid = payload.exp * 1000 > Date.now();
  if (!isValid) clearAccessToken();

  return isValid;
}
