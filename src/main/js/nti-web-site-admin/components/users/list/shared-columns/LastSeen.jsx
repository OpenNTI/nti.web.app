import React from 'react';

import { scoped } from '@nti/lib-locale';
import { DateTime, Typography, Variant } from '@nti/web-core';

const t = scoped('nti-web-site-admin.users.list.shared-columns.LastSeen', {
	title: 'Last Active',
	never: 'Never',
	now: 'Now',
});

const Type = {
	type: 'body',
};

LastSeenColumn.Name = t('title');
LastSeenColumn.CssClassName = css`
	width: 7rem;
`;

LastSeenColumn.SortOn = 'lastSeenTime';

LastSeenColumn.Create = props => Variant(LastSeenColumn, props);

export function LastSeenColumn({ item, getUser = x => x }) {
	const user = getUser(item);
	const lastSeenTime = user.getLastSeenTime?.();

	if (!lastSeenTime || lastSeenTime === 0) {
		return <Typography {...Type}>{t('never')}</Typography>;
	}

	const diff = Date.now() - lastSeenTime;

	if (diff <= 60 * 1000) {
		return <Typography {...Type}>{t('now')}</Typography>;
	}

	return <DateTime.RelativeAdverb date={lastSeenTime} {...Type} />;
}
