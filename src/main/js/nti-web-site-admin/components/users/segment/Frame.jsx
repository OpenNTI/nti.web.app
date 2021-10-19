import { useCallback } from 'react';

import { scoped } from '@nti/lib-locale';
import { DataContext } from '@nti/web-core/data';
import { Icons, ErrorMessage } from '@nti/web-core';
import { Router, LinkTo } from '@nti/web-routing';

import { SegmentStore } from './Store';

const t = scoped('nti-site-admin.components.users.segment.Frame', {
	back: 'Back to Segments',
});

const BackRouteName = 'site-admins.user.user-segments';

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
	const router = Router.useRouter();

	const afterDestroy = useCallback(
		() => router.routeTo.name(BackRouteName),
		[router]
	);

	const store = SegmentStore.useStore({ segmentID, afterDestroy });

	return (
		<DataContext store={store} fallback={<div />} error={<ErrorMessage />}>
			<Header>
				<LinkTo.Name name={BackRouteName}>
					<Icons.Chevron.Left />
					<span>{t('back')}</span>
				</LinkTo.Name>
			</Header>
			{children}
		</DataContext>
	);
}
