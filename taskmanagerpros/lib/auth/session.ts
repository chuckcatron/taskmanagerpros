import { cookies } from 'next/headers';
import { jwtVerify, SignJWT } from 'jose';

const SESSION_COOKIE_NAME = 'session';
const SESSION_DURATION = 60 * 60 * 24 * 7; // 7 days in seconds

interface SessionPayload {
  userId: string;
  email: string;
  name?: string;
  exp?: number;
}

/**
 * Get the secret key for session encryption
 */
function getSecretKey(): Uint8Array {
  const secret = process.env.SESSION_SECRET;

  if (!secret) {
    throw new Error('SESSION_SECRET environment variable is not set');
  }

  return new TextEncoder().encode(secret);
}

/**
 * Create a new session token
 */
export async function createSession(payload: Omit<SessionPayload, 'exp'>): Promise<string> {
  const secretKey = getSecretKey();

  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secretKey);

  return token;
}

/**
 * Verify and decode a session token
 */
export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const secretKey = getSecretKey();
    const { payload } = await jwtVerify(token, secretKey);

    // Validate the payload has required fields
    if (
      payload &&
      typeof payload === 'object' &&
      'userId' in payload &&
      'email' in payload &&
      typeof payload.userId === 'string' &&
      typeof payload.email === 'string'
    ) {
      return {
        userId: payload.userId,
        email: payload.email,
        name: typeof payload.name === 'string' ? payload.name : undefined,
        exp: typeof payload.exp === 'number' ? payload.exp : undefined,
      };
    }

    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Set the session cookie
 */
export async function setSessionCookie(payload: Omit<SessionPayload, 'exp'>): Promise<void> {
  const token = await createSession(payload);
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_DURATION,
    path: '/',
  });
}

/**
 * Get the session from cookies
 */
export async function getSessionFromCookie(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

  if (!sessionCookie?.value) {
    return null;
  }

  return verifySession(sessionCookie.value);
}

/**
 * Delete the session cookie
 */
export async function deleteSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

/**
 * Check if a user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getSessionFromCookie();
  return session !== null;
}

/**
 * Get the current user from the session
 */
export async function getCurrentUserFromSession(): Promise<SessionPayload | null> {
  return getSessionFromCookie();
}
