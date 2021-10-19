import React from 'react';

import { scoped } from '@nti/lib-locale';
import { Typography, Placeholder } from '@nti/web-core';
import { LinkTo } from '@nti/web-routing';

import { VerticallyCentered } from '../../shared-columns/Common';

const t = scoped(
	'nti-web-site-admin.components.users.list.segments.columns.Name',
	{
		title: 'Name',
	}
);

const Container = styled(VerticallyCentered)`
	padding: 21px 0.25rem 21px 30px;
`;

Name.CSSClassName = css`
	width: 350px;
	padding-left: 30px;
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
		<Container as={LinkTo.Object} object={item}>
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
