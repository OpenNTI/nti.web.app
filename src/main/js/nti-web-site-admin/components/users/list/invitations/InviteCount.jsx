import React from 'react';

import { DataContext } from '@nti/web-core/data';

import { InvitationCountStore } from './Store';

const Count = props => {
	const { count } = InvitationCountStore.useProperties();

	return <div {...props}>{count || 0}</div>;
};

export function InviteCount(props) {
	const store = InvitationCountStore.useStore();

	return (
		<DataContext store={store} fallback={<div />} error={<div />}>
			<Count {...props} />
		</DataContext>
	);
}
