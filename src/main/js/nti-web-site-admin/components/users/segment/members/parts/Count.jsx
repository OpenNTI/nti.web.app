import { scoped } from '@nti/lib-locale';
import { Typography, Placeholder } from '@nti/web-core';

import { MembersPreviewStore } from '../Store';

const t = scoped(
	'nti-web-site-admin.components.users.segment.members.parts.Count',
	{
		members: {
			one: '%(count)s Member',
			other: '%(count)s Members',
		},
	}
);

export const MembersCountPlaceholder = () => (
	<Placeholder.Text type="subhead-one" text="?? Members" />
);

export function MembersCount() {
	const { total } = MembersPreviewStore.useProperties();

	return (
		<Typography type="subhead-one">
			{t('members', { count: total })}
		</Typography>
	);
}
