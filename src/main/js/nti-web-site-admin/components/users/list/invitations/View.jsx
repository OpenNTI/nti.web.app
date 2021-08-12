import React from 'react';

import { DataContext } from '@nti/web-core/data';

import { InvitationsStore } from './Store';
import { InvitationsHeader } from './Header';
import { InvitationsTable } from './Table';
import { InvitationsFooter } from './Footer';

export default function InvitationsView() {
	const store = InvitationsStore.useStore();

	return (
		<DataContext store={store} fallback={<div>Loading...</div>}>
			<InvitationsHeader />
			<InvitationsTable />
			<InvitationsFooter />
		</DataContext>
	);
}
