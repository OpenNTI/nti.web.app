import React, { useState, useCallback } from 'react';

import { scoped } from '@nti/lib-locale';
import { Text } from '@nti/web-core';

import { InvitationsStore } from '../Store';
import { ResendButton } from '../controls/Resend';
import { CancelButton } from '../controls/Cancel';

import { Centered } from './Common';

const t = scoped(
	'nti-web-site-admin.components.users.list.invitations.columns.Controls',
	{
		accepted: 'Accepted',
		canceled: 'Canceled',
	}
);

const Container = styled(Centered)`
	padding: 0 18px;

	& > * + * {
		margin-left: 0.5rem;
	}
`;

const State = ({ item }) => (
	<Text typography="body" color="dark">
		{item.accepted && t('accepted')}
		{!item.accepted && item.expired && t('canceled')}
	</Text>
);

const Pending = ({ item, busy, setBusy, setNotBusy }) => (
	<>
		<ResendButton
			invites={[item]}
			disabled={busy}
			transparent
			before={setBusy}
			after={setNotBusy}
		/>
		<CancelButton
			invites={[item]}
			disabled={busy}
			transparent
			before={setBusy}
			after={setNotBusy}
		/>
	</>
);

const Cancelled = ({ item, busy, setBusy, setNotBusy }) => (
	<>
		<State item={item} />
		<ResendButton
			invites={[item]}
			disabled={busy}
			transparent
			before={setBusy}
			after={setNotBusy}
		/>
	</>
);

const Accepted = State;

Controls.Placeholder = () => null;
export function Controls({ item }) {
	const { selectionCount } = InvitationsStore.useProperties();

	const [busy, setBusyState] = useState();

	const setBusy = useCallback(() => setBusyState(true), [setBusyState]);
	const setNotBusy = useCallback(async () => {
		try {
			await item.refresh();
			setBusyState(false);
		} finally {
			setBusyState(false);
		}
	}, [setBusyState, item]);

	if (selectionCount) {
		return <State item={item} />;
	}

	let Cmp = Pending;

	if (item.accepted) {
		Cmp = Accepted;
	} else if (item.expired) {
		Cmp = Cancelled;
	}

	return (
		<Container>
			<Cmp
				item={item}
				busy={busy}
				setBusy={setBusy}
				setNotBusy={setNotBusy}
			/>
		</Container>
	);
}
