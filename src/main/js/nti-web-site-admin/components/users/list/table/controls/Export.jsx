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
			zero: 'Download list',
			one: 'Download list (%(count)s user)',
			other: 'Download list (%(count)s users)',
		},
	}
);

const useSiteUsersExport = (params, rel) => {
	const service = useService();
	const link =
		rel === 'Invitations'
			? service.getCollection(rel, rel).getLink(rel)
			: service.getUserWorkspace().getLink(rel);

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
	totalCount: PropTypes.number,
	rel: PropTypes.string,
};

function Export({ items: itemsProp, selectedUsers, params, totalCount, rel }) {
	const items = !selectedUsers?.length ? itemsProp : selectedUsers;

	const isSiteUsers = rel === 'SiteUsers';

	const hiddenInputs = items.map((item, index) => (
		<input
			key={index}
			type="hidden"
			name={isSiteUsers ? 'usernames' : 'codes'}
			value={isSiteUsers ? item.Username : item.code}
		/>
	));

	const link = useSiteUsersExport(params, rel);

	return (
		<UppercaseTooltip
			label={t('tooltipLabel', {
				count: selectedUsers?.length || totalCount || 0,
			})}
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
