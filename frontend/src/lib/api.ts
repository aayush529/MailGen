const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

type ApiErrorBody = {
  message?: string | string[];
  error?: string;
};

export type AuthResponse = {
  access_token: string;
};

export type SignupResponse = {
  id: string;
  name: string;
  email: string;
  createdAt?: string;
};

export type GoogleMockPayload = {
  name: string;
  email: string;
  sub: string;
};

async function readJson<T>(response: Response): Promise<T> {
  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorBody = body as ApiErrorBody;
    const message = Array.isArray(errorBody.message)
      ? errorBody.message.join(', ')
      : errorBody.message || errorBody.error || 'Something went wrong. Please try again.';

    throw new Error(message);
  }

  return body as T;
}

async function postJson<T>(path: string, payload: unknown): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  return readJson<T>(response);
}

export const authApi = {
  login(email: string, password: string) {
    return postJson<AuthResponse>('/auth/login', { email, password });
  },

  signup(name: string, email: string, password: string) {
    return postJson<SignupResponse>('/auth/signup', { name, email, password });
  },

  googleDemo(payload: GoogleMockPayload) {
    return postJson<AuthResponse>('/auth/google-mock', payload);
  },
};
