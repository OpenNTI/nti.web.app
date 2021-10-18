import React, { useCallback } from 'react';

import { Typography, Card, Button, Icons } from '@nti/web-core';

import { FilterSetGroup } from '../types/common';

import { ComponentRegistry } from './Registry';

const Join = styled(Typography).attrs({ type: 'body' })`
	font-weight: 600;

	&.depth-1 {
		padding: 0 0 0 1.125rem;
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

	&.depth-1 {
		padding: 0.625rem 0.25rem;
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
	list-style: none;
	padding: 0;
	margin: 0;
`;

const DepthToItemProps = {
	1: { as: Card, rounded: true, filled: true },
};

const DepthToControls = {
	1: ({ onRemove }) => {
		return (
			<ControlList as={Card} rounded>
				<Button transparent secondary onClick={onRemove}>
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

function FilterGroupItem({ filter, parent, onRemove }) {
	const { depth } = filter;

	const controls = {
		onRemove: useCallback(() => {
			onRemove(filter);
		}, [onRemove, filter]),
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
	const { depth, sets } = filter;
	const length = sets.length;

	const addNew = useCallback(() => filter.appendFilterSet(), [filter]);

	const remove = useCallback(
		subFilter => filter.removeFilterSet(subFilter),
		[filter]
	);

	return (
		<>
			<List depth={depth}>
				{sets.map((s, index) => (
					<li key={index}>
						<FilterGroupItem
							filter={s}
							parent={filter}
							onRemove={filter.canRemove && remove}
						/>
						{index < length - 1 && (
							<Join depth={depth}>
								<span>{filter.joinLabel}</span>
							</Join>
						)}
					</li>
				))}
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
