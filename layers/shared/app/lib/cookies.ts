const DEFAULT_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export function getCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;

  const cookies = document.cookie ? document.cookie.split("; ") : [];

  for (const cookie of cookies) {
    const [key, ...rest] = cookie.split("=");
    if (key === name) {
      const raw = rest.join("=");
      return decodeURIComponent(raw);
    }
  }

  return undefined;
}

export function setCookie(
  name: string,
  value: string,
  maxAge: number = DEFAULT_MAX_AGE,
): void {
  if (typeof document === "undefined") return;

  document.cookie = [
    `${name}=${encodeURIComponent(value)}`,
    "path=/",
    `max-age=${maxAge}`,
    "SameSite=Lax",
    // Hanya tambahkan Secure bila HTTPS
    globalThis.location.protocol === "https:" ? "Secure" : "",
  ].join("; ");
}

export function removeCookie(name: string): void {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
}
