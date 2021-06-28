import { scoped } from '@nti/lib-locale';
import { Connectors } from '@nti/lib-store';
import { Icons, Tooltip } from '@nti/web-commons';

const DownloadButton = styled('div')`
	cursor: pointer;
	box-sizing: border-box;
	height: 42px;
	width: 42px;
	border: 1px solid var(--border-grey-light);
	border-radius: 4px;
	background-color: white !important;
	margin-left: 0.5rem;
	position: relative;
`;

const DownloadIcon = styled(Icons.Download)`
	color: var(--primary-blue);
	width: 11px;
	height: 11px;
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%,-50%);
`;

const t = scoped('nti-web-site-admin.components.users.list.table.controls.Export', {
	tooltipLabel: 'DOWNLOAD LIST (%(count)s USERS)',
	tooltipLabelSingle: 'DOWNLOAD LIST (%(count)s USER)',
});

function Export ( { items, selectedUsers, exportUsers } ) {
	const handleDownloadButtonClick = () => {
		exportUsers(selectedUsers?.length || items);
	};

	const length = selectedUsers?.length || items.length;

	const tooltipLabel = length === 1 ? 'tooltipLabelSingle' : 'tooltipLabel';

	return (
		<Tooltip label={t(tooltipLabel, { count: length })}>
			<DownloadButton onClick={handleDownloadButtonClick}>
				<DownloadIcon />
			</DownloadButton>
		</Tooltip>
	);
}

export default Connectors.Any.connect([
	'selectedUsers',
	'exportUsers',
	'items',
])(Export);
