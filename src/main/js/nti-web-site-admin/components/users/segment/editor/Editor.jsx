import React from 'react';

import { Card } from '@nti/web-core';

import { MembersPreview } from '../members/Preview';
import { SegmentStore } from '../Store';

import { Header } from './Header';
import { SegmentFilters } from './filters/View';

const Container = styled.div`
	display: grid;
	grid-template-columns: 1fr 25%;
	grid-template-rows: auto;
	column-gap: 1%;
`;

const Contents = styled.div`
	grid-column: 1 / 2;
`;

const Sidebar = styled.div`
	grid-column: 2 / 3;
`;

export function SegmentEditor() {
	const { segment, filterSet } = SegmentStore.useProperties();

	return (
		<Container>
			<Contents>
				<Card>
					<Header />
					<SegmentFilters />
				</Card>
			</Contents>
			<Sidebar>
				<Card>
					<MembersPreview segment={segment} filterSet={filterSet} />
				</Card>
			</Sidebar>
		</Container>
	);
}
