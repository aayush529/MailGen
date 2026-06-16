export const jwtConstants = {
  secret: process.env.JWT_SECRET || 'super-secret-key-12345',
};

export function isGoogleOAuthConfigured(): boolean {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

export function getGoogleOAuthConfig() {
  return {
    clientID: process.env.GOOGLE_CLIENT_ID || 'google-oauth-not-configured',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'google-oauth-not-configured',
    callbackURL:
      process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/auth/google/callback',
  };
}

export function getFrontendUrl(): string {
  return process.env.FRONTEND_URL || 'http://localhost:5173';
}
