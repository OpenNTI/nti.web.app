import { useCallback, useMemo } from 'react';

import { Typography, Card, Button, Icons } from '@nti/web-core';

import { FilterSetGroup } from '../types/common';

import { ComponentRegistry } from './Registry';

const Join = styled(Typography).attrs({ type: 'body' })`
	display: flex;
	flex-direction: row;
	justify-content: flex-start;
	align-items: center;
	font-weight: 600;

	& > *:last-child {
		display: none;
		height: 1px;
		background-color: var(--border-grey-light);
		flex: 1 1 auto;
		margin-left: 0.5rem;
	}

	&.depth-1 {
		padding: 0 0 0 1.125rem;

		& > *:last-child {
			display: block;
		}
	}
`;

const SubItemContainer = styled.div`
	width: 100%;
	display: grid;
	grid-template-columns: 1fr 50px;
	column-gap: 0.625rem;

	&.depth-1 {
		margin: 1rem 0;
	}

	&.depth-2 {
		padding: 0 0 0 1.125rem;
	}
`;

const SubItem = styled.div`
	grid-column: 1 / 2;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	align-items: flex-start;

	&.depth-1 {
		padding: 0.625rem 0 0.625rem 0.25rem;
	}

	&.depth-2 {
		padding: 0.625rem 0;
	}

	&.filled {
		background-color: var(--panel-background);
	}
`;

const SubControls = styled.div`
	grid-column: 2 / 3;
`;

const ControlList = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: center;

	& > * {
		flex: 0 0 auto;
	}

	&.padded {
		padding: 0.625rem 0;
	}
`;

const List = styled('ul')`
	display: block;
	width: 100%;
	list-style: none;
	padding: 0;
	margin: 0;
`;

const DepthToItemProps = {
	1: { as: Card, rounded: true, filled: true },
};

const DepthToControls = {
	1: ({ onRemove, onDuplicate, onMoveUp, onMoveDown }) => {
		return (
			<ControlList as={Card} rounded>
				<Button
					transparent
					secondary
					onClick={onMoveUp}
					disabled={!onMoveUp}
				>
					<Icons.Arrow.Up fill />
				</Button>
				<Button
					transparent
					secondary
					onClick={onMoveDown}
					disabled={!onMoveDown}
				>
					<Icons.Arrow.Down fill />
				</Button>
				<Button
					transparent
					secondary
					onClick={onDuplicate}
					disabled={!onDuplicate}
				>
					<Icons.Duplicate />
				</Button>
				<Button
					transparent
					secondary
					onClick={onRemove}
					disabled={!onRemove}
				>
					<Icons.TrashCan fill />
				</Button>
			</ControlList>
		);
	},
	2: ({ onRemove }) => {
		return (
			<ControlList padded>
				<Button transparent secondary onClick={onRemove} p="sm">
					<Icons.X bold />
				</Button>
			</ControlList>
		);
	},
};

function FilterGroupItem({
	filter,
	parent,
	onRemove,
	onDuplicate,
	onMoveUp,
	onMoveDown,
}) {
	const { depth } = filter;

	const controls = {
		onRemove: useMemo(
			() => onRemove && (() => onRemove(filter)),
			[onRemove, filter]
		),

		onDuplicate: useMemo(
			() => onDuplicate && (() => onDuplicate(filter)),
			[onDuplicate, filter]
		),

		onMoveUp: useMemo(
			() => onMoveUp && (() => onMoveUp(filter)),
			[onMoveUp, filter]
		),

		onMoveDown: useMemo(
			() => onMoveDown && (() => onMoveDown(filter)),
			[onMoveDown, filter]
		),
	};

	const depthProps = DepthToItemProps[depth] ?? {};
	const depthControls = DepthToControls[depth]?.(controls) ?? null;

	const SubCmp = ComponentRegistry.getItem(filter);

	return (
		<SubItemContainer depth={depth}>
			<SubItem {...depthProps} depth={depth}>
				<SubCmp filter={filter} parent={parent} />
			</SubItem>
			{depthControls && <SubControls>{depthControls}</SubControls>}
		</SubItemContainer>
	);
}

export function FilterGroup({ filter }) {
	const { depth, filterSets } = filter;
	const length = filterSets.length;

	const addNew = useCallback(() => filter.appendFilterSet(), [filter]);

	const remove = useCallback(
		subFilter => filter.removeFilterSet(subFilter),
		[filter]
	);

	const duplicate = useCallback(
		subFilter => filter.duplicateFilterSet(subFilter),
		[filter]
	);

	const moveUp = useCallback(
		subFilter => filter.moveUpFilterSet(subFilter),
		[filter]
	);

	const moveDown = useCallback(
		subFilter => filter.moveDownFilterSet(subFilter),
		[filter]
	);

	return (
		<>
			<List depth={depth}>
				{filterSets.map((s, index) => {
					const first = index === 0;
					const last = index === length - 1;

					return (
						<li key={index}>
							<FilterGroupItem
								filter={s}
								parent={filter}
								onRemove={filter.canRemove && remove}
								onDuplicate={filter.canDuplicate && duplicate}
								onMoveUp={filter.canReorder && !first && moveUp}
								onMoveDown={
									filter.canReorder && !last && moveDown
								}
							/>
							{index < length - 1 && (
								<Join depth={depth}>
									<span>{filter.joinLabel}</span>
									<div />
								</Join>
							)}
						</li>
					);
				})}
			</List>
			{filter.canAdd && (
				<Button onClick={addNew} transparent rounded>
					<Icons.Add />
					<span>{filter.joinLabel}</span>
				</Button>
			)}
		</>
	);
}

ComponentRegistry.register(t => t instanceof FilterSetGroup, FilterGroup);
