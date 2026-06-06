import type { H3Event } from 'h3';

export function getClientIp(event: H3Event<globalThis.EventHandlerRequest>): string {
  return (
    getHeader(event, 'x-forwarded-for')?.split(',')[0]?.trim() || getHeader(event, 'x-real-ip') || event.node?.req?.socket?.remoteAddress || 'unknown'
  );
}
