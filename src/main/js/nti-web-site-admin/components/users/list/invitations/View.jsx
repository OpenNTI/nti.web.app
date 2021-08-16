import React from 'react';

import { ErrorMessage } from '@nti/web-core';
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
			<DataContext
				store={store}
				fallback={<Fallback />}
				error={
					<ErrorMessage as="div" type="subhead-one" center pv="lg" />
				}
			>
				<InvitationsHeader />
				<InvitationsTable />
				<InvitationsFooter />
			</DataContext>
		</div>
	);
}
