import { createError, deleteCookie, getCookie, setCookie, type H3Event } from 'h3';
import { SignJWT, jwtVerify } from 'jose';
import type { User } from '~/layers/users/types';
import { userService } from '~/layers/users/server/services/users.service';

const ACCESS_COOKIE = 'auth_access_token';
const REFRESH_COOKIE = 'auth_refresh_token';

type TokenType = 'access' | 'refresh';

type AuthJwtPayload = {
  email: string;
  type: TokenType;
};

const textEncoder = new TextEncoder();

const getAuthConfig = () => {
  const config = useRuntimeConfig();

  return {
    accessSecret: String(config.authAccessTokenSecret || process.env.NUXT_AUTH_ACCESS_TOKEN_SECRET || 'dev-access-token-secret-change-me'),
    refreshSecret: String(config.authRefreshTokenSecret || process.env.NUXT_AUTH_REFRESH_TOKEN_SECRET || 'dev-refresh-token-secret-change-me'),
    accessTtl: String(config.authAccessTokenTtl || process.env.NUXT_AUTH_ACCESS_TOKEN_TTL || '15m'),
    refreshTtl: String(config.authRefreshTokenTtl || process.env.NUXT_AUTH_REFRESH_TOKEN_TTL || '7d'),
  };
};

const getSecret = (type: TokenType) => {
  const config = getAuthConfig();
  return textEncoder.encode(type === 'access' ? config.accessSecret : config.refreshSecret);
};

const getTtl = (type: TokenType) => {
  const config = getAuthConfig();
  return type === 'access' ? config.accessTtl : config.refreshTtl;
};

const getCookieName = (type: TokenType) => (type === 'access' ? ACCESS_COOKIE : REFRESH_COOKIE);

const cookieOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
};

export const signAuthToken = async (user: Pick<User, 'id' | 'email'>, type: TokenType) => {
  return new SignJWT({ email: user.email, type } satisfies AuthJwtPayload)
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(String(user.id))
    .setIssuedAt()
    .setExpirationTime(getTtl(type))
    .sign(getSecret(type));
};

export const setAuthCookies = async (event: H3Event, user: Pick<User, 'id' | 'email'>) => {
  const [accessToken, refreshToken] = await Promise.all([signAuthToken(user, 'access'), signAuthToken(user, 'refresh')]);

  setCookie(event, ACCESS_COOKIE, accessToken, cookieOptions);
  setCookie(event, REFRESH_COOKIE, refreshToken, cookieOptions);
};

export const clearAuthCookies = (event: H3Event) => {
  deleteCookie(event, ACCESS_COOKIE, { path: '/' });
  deleteCookie(event, REFRESH_COOKIE, { path: '/' });
};

export const verifyAuthCookie = async (event: H3Event, type: TokenType = 'access') => {
  const token = getCookie(event, getCookieName(type));

  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
      message: 'Token Not Found',
    });
  }

  try {
    const verified = await jwtVerify<AuthJwtPayload>(token, getSecret(type));

    if (verified.payload.type !== type || !verified.payload.sub) {
      throw new Error('Invalid token payload');
    }

    return {
      userId: Number(verified.payload.sub),
      email: verified.payload.email,
    };
  } catch {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
      message: type === 'refresh' ? 'Refresh Token Expired' : 'Token Expired',
    });
  }
};

export const getCurrentUser = async (event: H3Event, type: TokenType = 'access') => {
  const payload = await verifyAuthCookie(event, type);
  return userService.findById(payload.userId);
};

export const requireAuth = async (event: H3Event) => {
  return getCurrentUser(event, 'access');
};

export const requirePermission = async (event: H3Event, permissions: string | string[], requireAll = true) => {
  const user = await requireAuth(event);
  const required = Array.isArray(permissions) ? permissions : [permissions];
  const userPermissions = new Set(user.permissions.map((permission) => permission.key));
  const allowed = requireAll ? required.every((permission) => userPermissions.has(permission)) : required.some((permission) => userPermissions.has(permission));

  if (!allowed) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden',
      message: 'Forbidden',
    });
  }

  return user;
};
