import React, { useEffect } from 'react';

import { ErrorMessage } from '@nti/web-core';
import { DataContext } from '@nti/web-core/data';

import { UserSegmentsStore } from './Store';
import { UserSegmentsFooter } from './Footer';
import { UserSegmentsHeader, UserSegmentHeaderPlaceholder } from './Header';
import { UserSegmentsTable, UserSegmentsTablePlaceholder } from './Table';

const Fallback = () => (
	<>
		<UserSegmentHeaderPlaceholder />
		<UserSegmentsTablePlaceholder />
	</>
);

export function Segments({ className, searchTerm }) {
	const store = UserSegmentsStore.useStore();

	useEffect(() => store.setSearchTerm(searchTerm), [searchTerm]);

	return (
		<div className={className}>
			<DataContext
				store={store}
				fallback={<Fallback />}
				error={
					<ErrorMessage as="div" type="subhead-one" center pv="lg" />
				}
			>
				<UserSegmentsHeader />
				<UserSegmentsTable />
				<UserSegmentsFooter />
			</DataContext>
		</div>
	);
}
