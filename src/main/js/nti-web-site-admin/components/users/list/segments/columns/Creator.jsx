import React from 'react';

import { scoped } from '@nti/lib-locale';
import { Typography, DisplayName, Placeholder } from '@nti/web-core';

import { VerticallyCentered } from '../../shared-columns/Common';

const t = scoped(
	'nti-web-site-admin.components.users.list.segments.columns.Creator',
	{
		title: 'Created By',
	}
);

Creator.CSSClassName = css`
	width: 7rem;
`;

Creator.Name = t('title');
Creator.SortOn = 'title';

Creator.Placeholder = () => (
	<VerticallyCentered>
		<Placeholder.Text type="body" text="First Lastname" />
	</VerticallyCentered>
);

export function Creator({ item }) {
	return (
		<VerticallyCentered>
			<Typography
				type="body"
				color="dark"
				limitLines={1}
				data-testid="segment-creator"
			>
				<DisplayName entity={item.creator} as="span" />
			</Typography>
		</VerticallyCentered>
	);
}
