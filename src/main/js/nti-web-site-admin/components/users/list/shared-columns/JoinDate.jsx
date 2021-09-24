import React from 'react';

import { scoped } from '@nti/lib-locale';
import { DateTime, Variant } from '@nti/web-core';

const t = scoped('nti-web-site-admin.users.list.shared-columns.JoinDate', {
	title: 'Join Date',
});

JoinDateColumn.Name = t('title');
JoinDateColumn.CssClassName = css`
	width: 7rem;
`;

JoinDateColumn.SortOn = 'createdTime';

JoinDateColumn.Create = props => Variant(JoinDateColumn, props);

export function JoinDateColumn({ item, getUser = x => x }) {
	const user = getUser(item);

	return (
		<DateTime
			type="body"
			date={user.getCreatedTime()}
			format={DateTime.MONTH_ABBR_DAY_YEAR}
		/>
	);
}
