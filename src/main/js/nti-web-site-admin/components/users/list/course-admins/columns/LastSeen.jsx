import { LastSeenColumn } from '../../shared-columns/LastSeen';

export const LastSeen = LastSeenColumn.Create({ getUser: i => i.user });
