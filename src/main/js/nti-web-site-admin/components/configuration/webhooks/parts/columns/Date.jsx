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

DateColumn.Placeholder = () => (
	<Cell.Placeholder
		css={css`
			max-width: 10em;
		`}
	/>
);
