import React, { useCallback, useState } from 'react';

import { scoped } from '@nti/lib-locale';
import { SelectMenu } from '@nti/web-core';

import Export from '../table/controls/Export';

import { InvitationsStore } from './Store';
import { InvitePeopleButton } from './InvitePeople';
import { CancelButton } from './controls/Cancel';
import { ResendButton } from './controls/Resend';

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

const Header = styled.div`
	display: flex;
	flex-direction: row;
	align-items: center;
	padding-left: 30px;
`;

const Controls = styled.div`
	flex: 1 1 auto;
	display: flex;
	flex-direction: row;
	justify-content: flex-end;
	align-items: center;

	& > * {
		margin-left: 0.5rem;
	}
`;

export const InvitationsHeaderPlaceholder = () => (
	<Header>
		<SelectMenu value="all" title={getFilterTitle('all')} disabled />
	</Header>
);

export function InvitationsHeader({ disabled }) {
	const {
		filter,
		setFilter,
		filterOptions,
		selection,
		batchParams,
		reload,
		clearSelection,
	} = InvitationsStore.useProperties();

	const hasSelection = !!selection?.length;

	const [busy, setBusyState] = useState();

	const setBusy = useCallback(() => setBusyState[true], [setBusyState]);
	const setNotBusy = useCallback(
		() => (clearSelection(), reload(), setBusy(false))
	);

	return (
		<Header>
			<SelectMenu
				options={filterOptions}
				value={filter}
				onChange={setFilter}
				title={getFilterTitle(filter)}
				getText={getFilterLabel}
			/>
			<Controls>
				{!hasSelection && <InvitePeopleButton rounded primary />}
				{hasSelection && (
					<ResendButton
						invites={selection}
						disabled={busy}
						before={setBusy}
						after={setNotBusy}
						inverted
						rounded
					/>
				)}
				{hasSelection && (
					<CancelButton
						invites={selection}
						disabled={busy}
						before={setBusy}
						after={setNotBusy}
						inverted
						rounded
						long
					/>
				)}
				<Export
					selectedUsers={selection}
					params={batchParams}
					rel="Invitations"
				/>
			</Controls>
		</Header>
	);
}