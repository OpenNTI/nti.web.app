import React from 'react';

import { scoped } from '@nti/lib-locale';
import { SelectMenu } from '@nti/web-core';

import { InvitationsStore } from './Store';

const t = scoped(
	'nti-web-site-admin.components.users.list.invitations.Header',
	{
		filters: {
			all: {
				label: 'All Invitations (default)',
				title: 'All Invitations',
			},
			accepted: {
				label: 'Accepted Invitations',
				title: 'Accepted Invitations',
			},
			pending: {
				label: 'Pending Invitations',
				title: 'Pending Invitations',
			},
			expired: {
				label: 'Canceled Invitations',
				title: 'Canceled Invitations',
			},
		},
	}
);

const getFilterLabel = f => t(`filters.${f}.label`);
const getFilterTitle = f => t(`filters.${f}.title`);

export function InvitationsHeader({ disabled }) {
	const { filter, setFilter, filterOptions } =
		InvitationsStore.useProperties();

	return (
		<div>
			<SelectMenu
				options={filterOptions}
				value={filter}
				onChange={setFilter}
				title={getFilterTitle(filter)}
				getText={getFilterLabel}
			/>
		</div>
	);
}
