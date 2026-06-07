import { createError, deleteCookie, getCookie, setCookie, type H3Event } from 'h3';
import { SignJWT, jwtVerify } from 'jose';
import type { User, Permission, Role } from '~/layers/users/types';

const ACCESS_COOKIE = 'auth_access_token';
const REFRESH_COOKIE = 'auth_refresh_token';

type TokenType = 'access' | 'refresh';

type AuthJwtPayload = {
  email: string;
  type: TokenType;
  sub?: string;
  name?: string;
  roles?: Role[];
  permissions?: Permission[];
};

type AuthTokenData = {
  userId: number;
  email: string;
  name: string;
  roles: Role[];
  permissions: Permission[];
};

const textEncoder = new TextEncoder();
const TIME_PERIOD_RE = /^(?:\d+|\d+[smhd])$/i;

const getAuthConfig = (event: H3Event) => {
  const config = useRuntimeConfig(event);
  const accessSecret = config.authAccessTokenSecret;
  const refreshSecret = config.authRefreshTokenSecret;
  const accessTtl = config.authAccessTokenTtl;
  const refreshTtl = config.authRefreshTokenTtl;

  if (!accessSecret || !refreshSecret || !accessTtl || !refreshTtl) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Server Error',
      message: 'Authentication runtime config is not fully configured',
    });
  }

  return {
    accessSecret: String(accessSecret),
    refreshSecret: String(refreshSecret),
    accessTtl: String(accessTtl),
    refreshTtl: String(refreshTtl),
  };
};

const normalizeTtl = (ttl: string, label: string) => {
  const value = ttl.trim();

  if (!TIME_PERIOD_RE.test(value)) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Server Error',
      message: `Invalid ${label} token TTL format. Use a jose time span like "15m", "7d", or a number of seconds.`,
    });
  }

  return /^\d+$/.test(value) ? Number(value) : value;
};

const getSecret = (event: H3Event, type: TokenType) => {
  const config = getAuthConfig(event);
  return textEncoder.encode(type === 'access' ? config.accessSecret : config.refreshSecret);
};

const getTtl = (event: H3Event, type: TokenType) => {
  const config = getAuthConfig(event);
  return type === 'access' ? normalizeTtl(config.accessTtl, 'access') : normalizeTtl(config.refreshTtl, 'refresh');
};

const getCookieName = (type: TokenType) => (type === 'access' ? ACCESS_COOKIE : REFRESH_COOKIE);

const getCookieOptions = (event: H3Event) => {
  const config = useRuntimeConfig(event);

  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: Boolean(config.isProduction),
    path: '/',
  };
};

export const signAuthToken = async (event: H3Event, user: Pick<User, 'id' | 'email' | 'name' | 'roles' | 'permissions'>, type: TokenType) => {
  return new SignJWT({
    email: user.email,
    type,
    name: user.name,
    roles: user.roles,
    permissions: user.permissions,
  } satisfies AuthJwtPayload)
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(String(user.id))
    .setIssuedAt()
    .setExpirationTime(getTtl(event, type))
    .sign(getSecret(event, type));
};

export const setAuthCookies = async (event: H3Event, user: Pick<User, 'id' | 'email' | 'name' | 'roles' | 'permissions'>) => {
  const [accessToken, refreshToken] = await Promise.all([signAuthToken(event, user, 'access'), signAuthToken(event, user, 'refresh')]);

  setCookie(event, ACCESS_COOKIE, accessToken, getCookieOptions(event));
  setCookie(event, REFRESH_COOKIE, refreshToken, getCookieOptions(event));
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
    const verified = await jwtVerify<AuthJwtPayload>(token, getSecret(event, type));

    if (verified.payload.type !== type || !verified.payload.sub) {
      throw new Error('Invalid token payload');
    }

    return {
      userId: Number(verified.payload.sub),
      email: verified.payload.email,
      name: verified.payload.name ?? '',
      roles: verified.payload.roles ?? [],
      permissions: verified.payload.permissions ?? [],
    } as AuthTokenData;
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

  return {
    id: payload.userId,
    email: payload.email,
    name: payload.name,
    roles: payload.roles,
    permissions: payload.permissions,
  };
};

export const requireAuth = async (event: H3Event) => {
  return getCurrentUser(event, 'access');
};

export const requirePermission = async (event: H3Event, permissions: string | string[], requireAll = true) => {
  const user = await requireAuth(event);
  const required = Array.isArray(permissions) ? permissions : [permissions];
  const userPermissions = new Set(user.permissions.map((permission) => permission.key));
  const allowed = requireAll
    ? required.every((permission) => userPermissions.has(permission))
    : required.some((permission) => userPermissions.has(permission));

  if (!allowed) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden',
      message: 'Forbidden',
    });
  }

  return user;
};
