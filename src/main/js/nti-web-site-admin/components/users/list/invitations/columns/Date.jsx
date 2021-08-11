import React from 'react';

import { scoped } from '@nti/lib-locale';
import { DateTime } from '@nti/web-core';

import { TableHeader, VerticallyCentered } from './Common';

const t = scoped(
	'nti-web-site-admin.components.users.list.invitations.columns.Date',
	{
		title: 'Invite Date',
	}
);

Date.Name = t('title');
Date.SortOn = 'created_time';
Date.HeaderComponent = TableHeader;
export function Date({ item }) {
	const date = item.getCreatedTime();

	return (
		<VerticallyCentered>
			<DateTime.RelativeAdverb date={date} />
		</VerticallyCentered>
	);
}
