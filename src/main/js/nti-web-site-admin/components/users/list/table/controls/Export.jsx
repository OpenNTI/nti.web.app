import React, { Suspense } from 'react';
import PropTypes from 'prop-types';

import { scoped } from '@nti/lib-locale';
import { Button, Form, Icons, Tooltip, useService } from '@nti/web-commons';
import { URL as URLUtils } from '@nti/lib-commons';

const UppercaseTooltip = styled(Tooltip)`
	text-transform: uppercase;
`;

const DownloadButton = styled(Button)`
	cursor: pointer;
	display: inline-flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	box-sizing: border-box;
	height: 42px;
	width: 42px;
	border: 1px solid var(--border-grey-light);
	border-radius: 4px;
	background-color: white !important;
	margin-left: 0.5rem;
`;

const DownloadIcon = styled(Icons.Download)`
	color: var(--primary-blue);
	width: 11px;
	height: 11px;
`;

const t = scoped(
	'nti-web-site-admin.components.users.list.table.controls.Export',
	{
		tooltipLabel: {
			selected: 'Download Selected Users',
			noSelected: 'Download All Users',
		},
	}
);

const useSiteUsersExport = (params, rel, filter) => {
	const service = useService();
	let link = null;

	if (filter === 'admin') {
		link = service.getWorkspace('SiteAdmin')?.getLink('SiteAdmins');
	} else if (rel === 'Invitations') {
		link = service.getCollection(rel, rel).getLink(rel);
	} else {
		link = service.getUserWorkspace().getLink(rel);
	}

	if (!link) {
		return null;
	}

	const clone = { ...params };

	delete clone.batchStart;
	delete clone.batchSize;

	return URLUtils.appendQueryParams(link, {
		...clone,
		format: 'text/csv',
	});
};

Export.propTypes = {
	items: PropTypes.array,
	selectedUsers: PropTypes.array,
	params: PropTypes.object,
	filter: PropTypes.string,
	rel: PropTypes.string,
};

function Export({ selectedUsers, params, filter, rel }) {
	const isSiteUsers = rel === 'SiteUsers';

	const hiddenInputs = (selectedUsers ?? []).map((item, index) => (
		<input
			key={index}
			type="hidden"
			name={isSiteUsers ? 'usernames' : 'codes'}
			value={isSiteUsers ? item.Username : item.code}
		/>
	));

	const link = useSiteUsersExport(params, rel, filter);

	return (
		<UppercaseTooltip
			label={
				selectedUsers?.length
					? t('tooltipLabel.selected')
					: t('tooltipLabel.noSelected')
			}
		>
			<form method="post" action={link} target="_blank">
				{hiddenInputs}
				<DownloadButton as={Form.SubmitButton} type="submit">
					<DownloadIcon />
				</DownloadButton>
			</form>
		</UppercaseTooltip>
	);
}

export default function EnrollButtonWrapper(props) {
	return (
		<Suspense fallback={<div />}>
			<Export {...props} />
		</Suspense>
	);
}
