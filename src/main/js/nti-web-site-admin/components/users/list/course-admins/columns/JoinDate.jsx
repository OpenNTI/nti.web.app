import { JoinDateColumn } from '../../shared-columns/JoinDate';

export const JoinDate = JoinDateColumn.Create({ getUser: i => i.user });
