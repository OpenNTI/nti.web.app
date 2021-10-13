import { useCallback } from 'react';

import { Input, Variant } from '@nti/web-core';
import { useProperties, StateStore } from '@nti/web-core/data';

import { Centered } from './Common';

const { Selectable } = StateStore.Behaviors;

const Cell = styled('td')`
	&.selected {
		&,
		& ~ td {
			background-color: var(--color-selected-background-light);
		}
	}
`;

SelectColumn.HeaderPlaceholderComponent = () => (
	<Input.Checkbox p="sm" disabled />
);
SelectColumn.HeaderComponent = () => {
	const { isAllSelected, selectAll, deselectAll } = useProperties(
		Selectable.hasBehavior
	);

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

SelectColumn.CSSClassName = css`
	width: 70px;
`;

SelectColumn.RendersContainer = true;
SelectColumn.Placeholder = () => null;
SelectColumn.Create = props => Variant(SelectColumn, props);
export function SelectColumn({ item }) {
	const { isSelected, select, deselect } = useProperties(
		Selectable.hasBehavior
	);

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
