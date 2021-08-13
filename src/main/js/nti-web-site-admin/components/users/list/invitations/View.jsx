import React from 'react';

import { DataContext } from '@nti/web-core/data';

import { InvitationsStore } from './Store';
import { InvitationsHeader, InvitationsHeaderPlaceholder } from './Header';
import { InvitationsTable, InvitationsTablePlaceholder } from './Table';
import { InvitationsFooter } from './Footer';

const Fallback = () => (
	<>
		<InvitationsHeaderPlaceholder />
		<InvitationsTablePlaceholder />
	</>
);

export default function InvitationsView({ className }) {
	const store = InvitationsStore.useStore();

	return (
		<div className={className}>
			<DataContext store={store} fallback={<Fallback />}>
				<InvitationsHeader />
				<InvitationsTable />
				<InvitationsFooter />
			</DataContext>
		</div>
	);
}
