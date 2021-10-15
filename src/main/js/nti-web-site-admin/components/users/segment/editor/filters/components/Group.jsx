import React, { useCallback } from 'react';

import { Typography, Card, Button, Icons } from '@nti/web-core';

import { FilterSetGroup } from '../types/common';

import { ComponentRegistry } from './Registry';
import { FilterRule } from './Rule';

const Join = styled(Typography).attrs({ type: 'body' })``;

const SubItemContainer = styled.div`
	width: 100%;
	display: grid;
	grid-template-columns: 1fr 50px;
	column-gap: 0.625rem;
`;

const SubItem = styled.div`
	grid-column: 1 / 2;
`;

const SubControls = styled.div`
	grid-column: 2 / 3;
`;

const ControlList = styled(Card)`
	display: flex;
	flex-direction: column;
	justify-content: center;

	& > * {
		flex: 0 0 auto;
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
			<ControlList rounded>
				<Button transparent secondary onClick={onRemove}>
					<Icons.TrashCan fill />
				</Button>
			</ControlList>
		);
	},
};

function FilterGroupItem({ filter, onRemove }) {
	const { depth } = filter;

	const controls = {
		onRemove: useCallback(() => {
			onRemove(filter);
		}, [onRemove]),
	};

	const depthProps = DepthToItemProps[depth] ?? {};
	const depthControls = DepthToControls[depth]?.(controls) ?? null;

	const SubCmp = ComponentRegistry.getItem(filter);

	return (
		<SubItemContainer depth={depth}>
			<SubItem {...depthProps}>
				<SubCmp filter={filter} />
			</SubItem>
			{depthControls && <SubControls>{depthControls}</SubControls>}
		</SubItemContainer>
	);
}

export function FilterGroup({ filter }) {
	const { depth, sets } = filter;
	const length = sets.length;

	const remove = useCallback(subFilter => {}, [filter]);

	return (
		<List depth={depth}>
			{sets.map((s, index) => (
				<li key={index}>
					<FilterGroupItem
						filter={s}
						onRemove={filter.canRemove && remove}
					/>
					{index === length - 1 && <Join>{filter.joinLabel}</Join>}
				</li>
			))}
			{sets.length === 0 && (
				<li>
					<FilterRule parent={filter} />
				</li>
			)}
		</List>
	);
}

ComponentRegistry.register(t => t instanceof FilterSetGroup, FilterGroup);
