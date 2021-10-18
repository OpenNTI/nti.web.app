import { DisplayName } from '@nti/web-core';

import { Cell } from './Cell';

OwnerColumn.Name = 'Created By';
export function OwnerColumn({ item }) {
	return (
		<Cell>
			{/* <Avatar entity={item.OwnerId} /> */}
			<DisplayName entity={item.OwnerId} />
		</Cell>
	);
}

OwnerColumn.Placeholder = () => (
	<Cell.Placeholder
		css={css`
			max-width: 7em;
		`}
	/>
);
