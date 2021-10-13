import React from 'react';

import { ErrorMessage, Box } from '@nti/web-core';
import { DataContext } from '@nti/web-core/data';

import { MembersPreviewStore } from './Store';
import { MembersCount, MembersCountPlaceholder } from './parts/Count';
import { MembersList } from './parts/List';

const Header = styled(Box).attrs({ p: 'sm' })`
	border-bottom: 1px solid var(--border-grey-light);
`;

const Placeholder = () => (
	<>
		<Header>
			<MembersCountPlaceholder />
		</Header>
	</>
);

export function MembersPreview({ segment, filterSet }) {
	const store = MembersPreviewStore.useStore({ segment, filterSet });

	return (
		<DataContext
			store={store}
			fallback={Placeholder}
			error={<ErrorMessage />}
		>
			<Header>
				<MembersCount />
			</Header>
			<MembersList />
		</DataContext>
	);
}
