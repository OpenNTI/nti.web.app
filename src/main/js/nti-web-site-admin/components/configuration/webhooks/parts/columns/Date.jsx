import { DateTime } from '@nti/web-core';

import { Cell } from './Cell';

DateColumn.Name = 'Created';
export function DateColumn({ item }) {
	return (
		<Cell>
			<DateTime date={item.getCreatedTime?.()} />
		</Cell>
	);
}
