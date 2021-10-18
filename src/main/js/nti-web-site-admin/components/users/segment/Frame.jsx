import { scoped } from '@nti/lib-locale';
import { DataContext } from '@nti/web-core/data';
import { Icons, ErrorMessage } from '@nti/web-core';
import { LinkTo } from '@nti/web-routing';

import { SegmentStore } from './Store';

const t = scoped('nti-site-admin.components.users.segment.Frame', {
	back: 'Back to Segments',
});

const Header = styled.div`
	padding: 1rem 0;

	& a {
		color: var(--primary-grey);
		display: flex;
		flex-direction: row;
		align-items: center;
	}

	& i {
		font-size: 0.875rem;
		font-weight: 700;
		width: 1rem;
	}
`;

export function SegmentFrame({ children, segmentID }) {
	const store = SegmentStore.useStore({ segmentID });

	return (
		<DataContext store={store} fallback={<div />} error={<ErrorMessage />}>
			<Header>
				<LinkTo.Name name="site-admins.user.user-segments">
					<Icons.Chevron.Left />
					<span>{t('back')}</span>
				</LinkTo.Name>
			</Header>
			{children}
		</DataContext>
	);
}
