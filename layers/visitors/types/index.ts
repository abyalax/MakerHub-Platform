import type { TrafficEvent } from '~/layers/traffics/types';
import type { User } from '~/layers/users/types';

export interface Visitor {
  id: number;
  anonymousId: string;
  userId?: string | undefined;
  userAgent?: string | undefined;
  ipHash?: string | undefined;
  firstSeenAt: Date;
  lastSeenAt: Date;
  user?: User | undefined;
  trafficEvents: TrafficEvent[];
}
