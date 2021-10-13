
import { scoped } from '@nti/lib-locale';
import { Tooltip } from '@nti/web-commons';
import { DataContext } from '@nti/web-core/data';

import { InvitationCountStore } from './Store';

const t = scoped(
	'nti-web-site-admin.components.users.list.invitations.InviteCount',
	{
		tooltip: {
			one: '%(count)s Pending Invitation',
			other: '%(count)s Pending Invitations',
		},
	}
);

const Count = props => {
	const { count } = InvitationCountStore.useProperties();

	return (
		<Tooltip label={t('tooltip', { count: count || 0 })}>
			<div {...props}>{count || 0}</div>
		</Tooltip>
	);
};

export function InviteCount(props) {
	const store = InvitationCountStore.useStore();

	return (
		<DataContext store={store} fallback={<div />} error={<div />}>
			<Count {...props} />
		</DataContext>
	);
}
