import React, { Suspense } from 'react';
import PropTypes from 'prop-types';

import { scoped } from '@nti/lib-locale';
import { Button, Form, Icons, Tooltip, useService } from '@nti/web-commons';
import { URL as URLUtils } from '@nti/lib-commons';

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
		tooltipLabel: 'DOWNLOAD LIST (%(count)s USERS)',
		tooltipLabelSingle: 'DOWNLOAD LIST (%(count)s USER)',
	}
);

const useSiteUsersExport = (params, rel) => {
	const service = useService();
	const link =
		rel === 'SiteUsers'
			? service.getUserWorkspace().getLink(rel)
			: service.getCollection(rel, rel).getLink(rel);

	return URLUtils.appendQueryParams(link, {
		...params,
		format: 'text/csv',
		batchSize: undefined,
		batchStart: undefined,
	});
};

Export.propTypes = {
	items: PropTypes.array,
	selectedUsers: PropTypes.array,
	params: PropTypes.object,
	rel: PropTypes.string,
};

function Export({ items: itemsProp, selectedUsers, params, rel }) {
	const items =
		(selectedUsers ?? []).length === 0 ? itemsProp : selectedUsers;

	const tooltipLabel =
		items.length === 1 ? 'tooltipLabelSingle' : 'tooltipLabel';

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
		<Tooltip label={t(tooltipLabel, { count: items.length })}>
			<form method="post" action={link} target="_blank">
				{hiddenInputs}
				<DownloadButton as={Form.SubmitButton} type="submit">
					<DownloadIcon />
				</DownloadButton>
			</form>
		</Tooltip>
	);
}

export default function EnrollButtonWrapper(props) {
	return (
		<Suspense fallback={<div />}>
			<Export {...props} />
		</Suspense>
	);
}
