import { Status } from '../Status';

import { Cell } from './Cell';

StatusColumn.Name = 'Status';
export function StatusColumn({ item }) {
	return (
		<Cell>
			<Status item={item} />
		</Cell>
	);
}
