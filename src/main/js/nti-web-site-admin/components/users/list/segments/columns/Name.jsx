import React from 'react';

import { scoped } from '@nti/lib-locale';
import { Typography, Placeholder } from '@nti/web-core';

import { VerticallyCentered } from '../../shared-columns/Common';

const t = scoped(
	'nti-web-site-admin.components.users.list.segments.columns.Name',
	{
		title: 'Name',
	}
);

const Container = styled(VerticallyCentered)`
	padding: 21px 0.25rem;
`;

Name.CSSClassName = css`
	width: 350px;
`;

Name.Name = t('title');
Name.SortOn = 'title';

Name.Placeholder = () => (
	<Container>
		<Placeholder.Text type="body" text="Segment Title" />
	</Container>
);

export function Name({ item }) {
	return (
		<Container>
			<Typography
				type="body"
				color="dark"
				limitLines={1}
				data-testid="segment-title"
			>
				{item.title}
			</Typography>
		</Container>
	);
}
