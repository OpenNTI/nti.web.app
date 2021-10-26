import React, { useCallback, useState } from 'react';

import { url as UrlUtils } from '@nti/lib-commons';
import { scoped } from '@nti/lib-locale';
import {
	Icons,
	DownloadForm,
	SubmitButton,
	Tooltip,
	Toast,
} from '@nti/web-core';
import { isFlag } from '@nti/web-client';

const t = scoped(
	'nti-web-site-admin.components.users.segment.members.parts.Export',
	{
		tooltip: 'Download Segment Members',
		toast: {
			title: 'Generating Segment Members',
			description:
				'This may take a while. Once generated the report will begin downloading.',
		},
	}
);

const ParamBlackList = ['batchStart', 'batchSize'];

const UppercaseTooltip = styled(Tooltip)`
	text-transform: uppercase;
`;

function getExportLink(href) {
	const url = UrlUtils.parse(href);

	for (let key of ParamBlackList) {
		url.searchParams.delete(key);
	}

	url.searchParams.set('format', 'text/csv');

	return url.toString();
}

const Export = React.forwardRef(({ action, ...props }, ref) => {
	return (
		<form
			method="post"
			action={action}
			target="_blank"
			{...props}
			ref={ref}
		/>
	);
});

const ProgressExport = React.forwardRef(({ action, ...props }, ref) => {
	const [generating, setGenerating] = useState(false);

	const onSubmit = useCallback(() => setGenerating(true), [setGenerating]);
	const onDownloadStarted = useCallback(
		() => setGenerating(false),
		[setGenerating]
	);

	return (
		<>
			<DownloadForm
				action={action}
				method="post"
				onSubmit={onSubmit}
				onDownloadStarted={onDownloadStarted}
				ref={ref}
				{...props}
			/>
			{generating && (
				<Toast title={t('toast.title')} icon={<Icons.Download />}>
					{t('toast.description')}
				</Toast>
			)}
		</>
	);
});

export function MembersExport({ href }) {
	const exportLink = getExportLink(href);
	const Form = isFlag('download-progress') ? ProgressExport : Export;

	return (
		<UppercaseTooltip label={t('tooltip')}>
			<Form action={exportLink}>
				<SubmitButton large rounded inverted>
					<Icons.Download />
				</SubmitButton>
			</Form>
		</UppercaseTooltip>
	);
}
