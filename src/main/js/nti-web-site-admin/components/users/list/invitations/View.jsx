import { useEffect } from 'react';

import { scoped } from '@nti/lib-locale';
import { ErrorMessage } from '@nti/web-core';
import { DataContext } from '@nti/web-core/data';
import { WithSearch } from '@nti/web-search';

import { InvitationsStore } from './Store';
import { InvitationsHeader, InvitationsHeaderPlaceholder } from './Header';
import { InvitationsTable, InvitationsTablePlaceholder } from './Table';
import { InvitationsFooter } from './Footer';

const t = scoped('nti-web-site-admin.components.users.list.invitations.View', {
	search: 'Invitations',
});

const Fallback = () => (
	<>
		<InvitationsHeaderPlaceholder />
		<InvitationsTablePlaceholder />
	</>
);

function InvitationsView({ className, searchTerm }) {
	const store = InvitationsStore.useStore();

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
				<InvitationsHeader />
				<InvitationsTable />
				<InvitationsFooter />
			</DataContext>
		</div>
	);
}

export default WithSearch(InvitationsView, { label: t('search') });
