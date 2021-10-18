import { Placeholder } from '@nti/web-core';

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

StatusColumn.Placeholder = () => (
	<div
		css={css`
			display: flex;
			align-items: center;
			justify-items: flex-start;
			gap: var(--padding-xs, 0.375em);
		`}
	>
		<Placeholder.Image
			css={css`
				flex: 0 0 6px;
				height: 6px;
				border-radius: 50%;
			`}
		/>
		<Cell.Placeholder
			css={css`
				flex: 1 1 auto;
				max-width: 5em;
			`}
		/>
	</div>
);
