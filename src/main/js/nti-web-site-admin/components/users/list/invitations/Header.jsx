import React, { useCallback, useState } from 'react';

import { scoped } from '@nti/lib-locale';
import { SelectMenu, Tooltip } from '@nti/web-core';
import { isFlag } from '@nti/web-client';

import SearchInfo from '../../../common/SearchInfo';
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
				label: 'All Invitations',
				title: 'All Invitations',
			},
			accepted: {
				label: 'Accepted Invitations',
				title: 'Accepted Invitations',
			},
			pending: {
				label: 'Pending Invitations (default)',
				title: 'Pending Invitations',
			},
			expired: {
				label: 'Canceled Invitations',
				title: 'Canceled Invitations',
			},
		},
		resendTooltip: {
			one: 'Re-send Invite (%(count)s User)',
			other: 'Re-send Invites (%(count)s Users)',
		},
		cancelTooltip: {
			one: 'Cancel Invite (%(count)s User)',
			other: 'Cancel Invites (%(count)s Users)',
		},
		deleteTooltip: {
			one: 'Delete Invite (%(count)s User)',
			other: 'Delete Invites (%(count)s Users)',
		},
	}
);

const HideBulkFilters = {
	accepted: true,
	all: true,
};

const getFilterLabel = f => t(`filters.${f}.label`);
const getFilterTitle = f => t(`filters.${f}.title`);

const Header = styled.div`
	display: flex;
	flex-direction: row;
	align-items: center;
	padding: 20px 30px 10px;
	gap: 0.5rem;

	& > * {
		white-space: nowrap;
	}
`;

const Controls = styled.div`
	flex: 1 1 auto;
	display: flex;
	flex-direction: row;
	justify-content: flex-end;
	align-items: center;
	gap: 0.5rem;
`;

export const InvitationsHeaderPlaceholder = () => (
	<Header>
		<SelectMenu value="all" title={getFilterTitle('pending')} disabled />
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
		searchTerm,
	} = InvitationsStore.useProperties();

	const hasSelection = !!selection?.length;
	const selectionCount = (selection ?? []).length;

	const [busy, setBusyState] = useState();

	const setBusy = useCallback(() => setBusyState[true], [setBusyState]);
	const setNotBusy = useCallback(
		() => (clearSelection(), reload(), setBusy(false))
	);

	const resendLabel = t('resendTooltip', { count: selectionCount });

	const deletes = filter === 'expired';
	const cancelLabel = deletes
		? t('deleteTooltip', { count: selectionCount })
		: t('cancelTooltip', { count: selectionCount });

	return (
		<>
			<Header>
				<SelectMenu
					options={filterOptions}
					value={filter}
					onChange={setFilter}
					title={getFilterTitle(filter)}
					getText={getFilterLabel}
				/>
				<Controls>
					{!hasSelection && (
						<InvitePeopleButton large rounded primary />
					)}
					{hasSelection && !HideBulkFilters[filter] && (
						<>
							<Tooltip label={resendLabel}>
								<span>
									<ResendButton
										invites={selection}
										disabled={busy}
										before={setBusy}
										after={setNotBusy}
										large
										inverted
										rounded
									/>
								</span>
							</Tooltip>
							<Tooltip label={cancelLabel}>
								<span>
									<CancelButton
										invites={selection}
										disabled={busy}
										before={setBusy}
										after={setNotBusy}
										large
										inverted
										rounded
										long
										deletes={filter === 'expired'}
									/>
								</span>
							</Tooltip>
						</>
					)}
					{isFlag('export-users') && (
						<Export
							selectedUsers={selection}
							params={batchParams}
							rel="Invitations"
						/>
					)}
				</Controls>
			</Header>
			<SearchInfo searchTerm={searchTerm} />
		</>
	);
}
