import React, { useState, useCallback } from 'react';

import { scoped } from '@nti/lib-locale';
import { Typography } from '@nti/web-core';

import { InvitationsStore } from '../Store';
import { ResendButton } from '../controls/Resend';
import { CancelButton } from '../controls/Cancel';

const t = scoped(
	'nti-web-site-admin.components.users.list.invitations.columns.Controls',
	{
		accepted: 'Accepted',
		canceled: 'Canceled',
	}
);

const Container = styled.div`
	display: flex;
	justify-content: flex-start;
	align-items: center;
	padding: 0 18px;

	& > * {
		width: 50%;
	}
`;

const StateCmp = styled(Typography).attrs({ type: 'body', color: 'dark' })`
	display: block;
	text-align: center;
`;

const State = ({ item }) => (
	<StateCmp>
		{item.accepted && t('accepted')}
		{!item.accepted && item.expired && t('canceled')}
	</StateCmp>
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
		return (
			<Container>
				<State item={item} />
			</Container>
		);
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
