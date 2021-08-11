import React from 'react';

import { scoped } from '@nti/lib-locale';

import { TableHeader } from './Common';

const t = scoped(
	'nti-web-site-admin.components.users.list.invitations.columns.Name',
	{
		title: 'Name',
	}
);

Name.Name = t('title');
Name.SortOn = 'receiver';
Name.HeaderComponent = TableHeader;
export function Name({ item }) {
	return <div>{item.getID()}</div>;
}
