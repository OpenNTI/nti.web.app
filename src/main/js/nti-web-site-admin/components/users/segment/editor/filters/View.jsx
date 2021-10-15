import React, { useEffect } from 'react';

import { SegmentStore } from '../../Store';

import { getType } from './types/Types';
import { getCmp } from './components/Components';

const Container = styled.div`
	padding: 30px;
	border-top: 1px solid var(--border-grey-light);
	min-height: 200px;
	background: var(--panel-background);
`;

export function SegmentFilters() {
	const { filterSet, setFilterSet } = SegmentStore.useProperties();

	const filter = getType(filterSet);

	useEffect(
		() => filter.subscribe(() => setFilterSet(filter.getFilterSet())),
		[filter, setFilterSet]
	);

	const Cmp = getCmp(filter);

	return (
		<Container>
			<Cmp filter={filter} />
		</Container>
	);
}
