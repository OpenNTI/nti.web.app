import { useCallback } from 'react';

import { scoped } from '@nti/lib-locale';
import { Card, ErrorMessage } from '@nti/web-core';
import { DataContext } from '@nti/web-core/data';
import { Prompt } from '@nti/web-commons';
import { Router } from '@nti/web-routing';

import { SegmentStore } from '../Store';

import { MembersStore } from './Store';
import { MembersExport } from './parts/Export';
import {
	SegmentMembersTable,
	SegmentMembersTablePlaceholder,
} from './parts/Table';

const t = scoped(
	'nti-web-site-admin.components.users.segment.members.parts.Modal',
	{
		users: {
			one: '%(count)s User',
			other: '%(count)s Users',
		},
	}
);

const ModalPlaceholder = props => (
	<Prompt.PagingWindow {...props}>
		<SegmentMembersTablePlaceholder />
	</Prompt.PagingWindow>
);

const ModalError = props => (
	<Card rounded>
		<ErrorMessage as="div" type="body" center pv="md" />
	</Card>
);

const Modal = props => {
	const { total, href } = MembersStore.useProperties();

	return (
		<Prompt.PagingWindow
			{...props}
			subTitle={t('users', { count: total })}
			controls={<MembersExport href={href} />}
		>
			<SegmentMembersTable />
		</Prompt.PagingWindow>
	);
};

export function MembersModal() {
	const { segment, title, filterSet } = SegmentStore.useProperties();
	const store = MembersStore.useStore({ segment, filterSet });

	const router = Router.useRouter();
	const onDismiss = useCallback(() => router.routeTo.path('#'), [router]);

	return (
		<Prompt.Dialog onBeforeDismiss={onDismiss}>
			<DataContext
				store={store}
				fallback={
					<ModalPlaceholder title={title} onDismiss={onDismiss} />
				}
				error={<ModalError />}
			>
				<Modal title={title} onDismiss={onDismiss} />
			</DataContext>
		</Prompt.Dialog>
	);
}
