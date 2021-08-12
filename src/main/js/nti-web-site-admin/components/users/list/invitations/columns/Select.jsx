import React, { useCallback } from 'react';

import { Input } from '@nti/web-core';

import { InvitationsStore } from '../Store';

import { Centered } from './Common';

const Cell = styled('td')`
	&.selected {
		&,
		& ~ td {
			background-color: var(--color-selected-background-light);
		}
	}
`;

Select.HeaderPlaceholderComponent = () => <Input.Checkbox p="sm" disabled />;
Select.HeaderComponent = () => {
	const { isAllSelected, selectAll, deselectAll } =
		InvitationsStore.useProperties();

	const onChange = useCallback(
		e => {
			if (isAllSelected()) {
				deselectAll();
			} else {
				selectAll();
			}
		},
		[isAllSelected, selectAll, deselectAll]
	);

	return (
		<Input.Checkbox checked={isAllSelected()} onChange={onChange} p="sm" />
	);
};

Select.RendersContainer = true;
Select.CSSClassName = css`
	width: 70px;
`;

Select.Placeholder = () => null;
export function Select({ item }) {
	const { isSelected, select, deselect } = InvitationsStore.useProperties();

	const selected = isSelected(item);
	const onChange = useCallback(
		e => {
			if (selected) {
				deselect(item);
			} else {
				select(item);
			}
		},
		[item, select, deselect, selected]
	);

	return (
		<Cell selected={selected}>
			<Centered>
				<Input.Checkbox checked={selected} onChange={onChange} />
			</Centered>
		</Cell>
	);
}
