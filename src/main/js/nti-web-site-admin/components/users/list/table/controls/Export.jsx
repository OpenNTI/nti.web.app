import { Suspense, useState, useCallback } from 'react';
import PropTypes from 'prop-types';

import { scoped } from '@nti/lib-locale';
import { isFlag } from '@nti/web-client';
import { Form, Tooltip } from '@nti/web-commons';
import {
	useService,
	Button,
	Icons,
	DownloadForm,
	Toast,
	SubmitButton,
} from '@nti/web-core';
import { url } from '@nti/lib-commons';

const UppercaseTooltip = styled(Tooltip)`
	text-transform: uppercase;
`;

const t = scoped(
	'nti-web-site-admin.components.users.list.table.controls.Export',
	{
		tooltipLabel: {
			selected: {
				one: 'Download (%(count)s User)',
				other: 'Download (%(count)s Users)',
			},
			noSelected: 'Download All Users',
		},
		toast: {
			title: 'Generating Users Report',
			description:
				'This may take a while. Once generated the report will begin downloading.',
		},
	}
);

const useSiteUsersExport = (linkProp, params, rel, filter) => {
	const service = useService();
	const clone = { ...params };

	delete clone.batchStart;
	delete clone.batchSize;

	if (linkProp) {
		return url.appendQueryParams(linkProp, {
			...clone,
			format: 'text/csv',
		});
	}

	let link = null;

	if (filter === 'admin') {
		link = service.getWorkspace('SiteAdmin')?.getLink('SiteAdmins');
	} else if (rel === 'Invitations') {
		link = service.getCollection(rel, rel).getLink(rel);
	} else if (rel === 'CourseAdmins') {
		link = service.getWorkspace('Courses').getLink(rel);
	} else {
		link = service.getUserWorkspace().getLink(rel);
	}

	if (!link) {
		return null;
	}

	return url.appendQueryParams(link, {
		...clone,
		format: 'text/csv',
	});
};

Export.propTypes = {
	link: PropTypes.string,
	items: PropTypes.array,
	selectedUsers: PropTypes.array,
	params: PropTypes.object,
	filter: PropTypes.string,
	rel: PropTypes.string,
};

function Export({ link: linkProp, selectedUsers, params, filter, rel }) {
	const isSiteUsers = rel === 'SiteUsers' || rel === 'CourseAdmins';

	const hiddenInputs = (selectedUsers ?? []).map((item, index) => (
		<input
			key={index}
			type="hidden"
			name={isSiteUsers ? 'usernames' : 'codes'}
			value={isSiteUsers ? item.Username : item.code}
		/>
	));

	const link = useSiteUsersExport(linkProp, params, rel, filter);

	return !link ? null : (
		<UppercaseTooltip
			label={
				selectedUsers?.length
					? t('tooltipLabel.selected', {
							count: selectedUsers?.length,
					  })
					: t('tooltipLabel.noSelected')
			}
		>
			<form method="post" action={link} target="_blank">
				{hiddenInputs}
				<Button
					as={Form.SubmitButton}
					type="submit"
					large
					rounded
					inverted
				>
					<Icons.Download />
				</Button>
			</form>
		</UppercaseTooltip>
	);
}

function ExperimentalExport({
	link: linkProp,
	selectedUsers,
	params,
	filter,
	rel,
}) {
	const link = useSiteUsersExport(linkProp, params, rel, filter);
	const downloadParams = {
		usernames: (selectedUsers ?? []).map(s => s.Username),
	};

	const [generating, setGenerating] = useState(false);

	const onSubmit = useCallback(() => setGenerating(true), [setGenerating]);
	const onDownloadStarted = useCallback(
		() => setGenerating(false),
		[setGenerating]
	);

	return (
		<>
			<UppercaseTooltip
				label={
					selectedUsers?.length
						? t('tooltipLabel.selected', {
								count: selectedUsers?.length,
						  })
						: t('tooltipLabel.noSelected')
				}
			>
				<DownloadForm
					action={link}
					method="post"
					params={downloadParams}
					onSubmit={onSubmit}
					onDownloadStarted={onDownloadStarted}
				>
					<SubmitButton large rounded inverted>
						<Icons.Download />
					</SubmitButton>
				</DownloadForm>
			</UppercaseTooltip>
			{generating && (
				<Toast title={t('toast.title')} icon={<Icons.Download />}>
					{t('toast.description')}
				</Toast>
			)}
		</>
	);
}

export default function EnrollButtonWrapper(props) {
	const { rel, filter } = props;

	return (
		<Suspense fallback={<div />}>
			{isFlag('download-progress') &&
			rel === 'SiteUsers' &&
			filter !== 'admin' ? (
				<ExperimentalExport {...props} />
			) : (
				<Export {...props} />
			)}
		</Suspense>
	);
}
