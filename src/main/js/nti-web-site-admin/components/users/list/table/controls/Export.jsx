import { scoped } from '@nti/lib-locale';
import { Connectors } from '@nti/lib-store';
import { Icons, Tooltip } from '@nti/web-commons';

const DownloadButton = styled.a`
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

const t = scoped('nti-web-site-admin.components.users.list.table.controls.Export', {
	tooltipLabel: 'DOWNLOAD LIST (%(count)s USERS)',
	tooltipLabelSingle: 'DOWNLOAD LIST (%(count)s USER)',
});

function Export ( { items, selectedUsers, usersDownloadLink } ) {
	const length = selectedUsers?.length || items.length;

	const tooltipLabel = length === 1 ? 'tooltipLabelSingle' : 'tooltipLabel';

	return (
		<Tooltip label={t(tooltipLabel, { count: length })}>
			<DownloadButton href={usersDownloadLink}>
				<DownloadIcon />
			</DownloadButton>
		</Tooltip>
	);
}

export default Connectors.Any.connect([
	'items',
	'selectedUsers',
	'usersDownloadLink',
])(Export);
