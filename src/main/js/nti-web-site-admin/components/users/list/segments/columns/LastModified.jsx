import { scoped } from '@nti/lib-locale';
import { DateTime, Placeholder } from '@nti/web-core';

import { VerticallyCentered } from '../../shared-columns/Common';

const t = scoped(
	'nti-web-site-admin.components.users.list.segments.columns.LastModified',
	{
		title: 'Last Updated',
	}
);

LastModified.CSSClassName = css`
	width: 7rem;
`;

LastModified.Name = t('title');
LastModified.SortOn = 'lastmodified';

LastModified.Placeholder = () => (
	<VerticallyCentered>
		<Placeholder.Text type="body" text="MMMM D, YYYY" />
	</VerticallyCentered>
);

export function LastModified({ item }) {
	return (
		<VerticallyCentered>
			<DateTime
				date={item.getLastModified()}
				format={DateTime.MONTH_NAME_DAY_YEAR}
				type="body"
				color="dark"
				limitLines={1}
				data-testid="segment-last-modified"
			/>
		</VerticallyCentered>
	);
}
