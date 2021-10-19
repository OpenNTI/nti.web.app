import { useEffect, useState, useRef } from 'react';

import { useForceUpdate, ErrorMessage } from '@nti/web-core';

import { SegmentStore } from '../../Store';

import { getType } from './types/Types';
import { getCmp } from './components/Components';

const Container = styled.div`
	padding: 14px 30px 30px;
	border-top: 1px solid var(--border-grey-light);
	min-height: 200px;
`;

export function SegmentFilters() {
	const { filterSet, setFilterSet, save } = SegmentStore.useProperties();

	const seen = useRef();

	if (!seen.current) {
		seen.current = new Set();
	}

	const update = useForceUpdate();
	const [filter, setFilter] = useState(null);

	useEffect(() => {
		if (seen.current.has(filterSet)) {
			seen.current.delete(filterSet);
		} else {
			setFilter(getType(filterSet));
		}
	}, [filterSet]);

	useEffect(
		() =>
			filter?.subscribe(() => {
				if (filter.isEmpty()) {
					setFilterSet(null);
					setFilter(getType(null));
					return;
				}

				const json = filter.toJSON();
				seen.current.add(json);
				setFilterSet(json, filter.getErrors());
				update();
			}),
		[filter, setFilterSet]
	);

	const Cmp = getCmp(filter);

	if (!Cmp) {
		return null;
	}

	return (
		<Container>
			<ErrorMessage error={save.error} />
			<Cmp filter={filter} setFilter={setFilter} />
		</Container>
	);
}
