import React, { Suspense } from 'react';

import { scoped } from '@nti/lib-locale';
import { Connectors } from '@nti/lib-store';
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

const useSiteUsersExport = params => {
	const service = useService();
	const link = service.getUserWorkspace().getLink('SiteUsers');
	return URLUtils.appendQueryParams(link, { ...params, format: 'text/csv' });
};

function Export({ items, selectedUsers, params }) {
	const users = selectedUsers.length === 0 ? items : selectedUsers;

	const tooltipLabel =
		users.length === 1 ? 'tooltipLabelSingle' : 'tooltipLabel';

	const hiddenInputs = users.map((user, index) => (
		<input
			key={index}
			type="hidden"
			name="usernames"
			value={user.Username}
		/>
	));

	const link = useSiteUsersExport(params);

	return (
		<Tooltip label={t(tooltipLabel, { count: users.length })}>
			<form method="post" action={link} encrypt="multipart/form-data">
				{hiddenInputs}
				<DownloadButton as={Form.SubmitButton} type="submit">
					<DownloadIcon />
				</DownloadButton>
			</form>
		</Tooltip>
	);
}

const ConnectedExport = Connectors.Any.connect([
	'items',
	'selectedUsers',
	'params',
])(Export);

export default function EnrollButtonWrapper(props) {
	return (
		<Suspense fallback={<div />}>
			<ConnectedExport {...props} />
		</Suspense>
	);
}
