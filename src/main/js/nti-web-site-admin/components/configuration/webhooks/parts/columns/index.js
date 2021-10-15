import { DateColumn } from './Date';
import { StatusColumn } from './Status';
import { OwnerColumn } from './Owner';
import { TargetColumn } from './Target';
import { MessageColumn } from './Message';

export const SUBSCRIPTION_COLUMNS = [
	DateColumn,
	StatusColumn,
	OwnerColumn,
	TargetColumn,
];

export const HISTORY_COLUMNS = [DateColumn, StatusColumn, MessageColumn];
