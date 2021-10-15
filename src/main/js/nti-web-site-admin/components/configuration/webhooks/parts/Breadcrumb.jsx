import { LinkTo, useLocation, useRouteMatch } from '@nti/web-routing';
import { Icons } from '@nti/web-core';

import t from '../strings';

const Container = styled.div`
	display: flex;
	align-items: flex-start;

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

export function Breadcrumb(props) {
	const { pathname } = useLocation();
	const [base] = pathname.split('/webhooks');
	const match = useRouteMatch(base + '/webhooks/:subscription/:attempt?');
	const { params: { attempt } = {} } = match || {};
	return !match ? null : (
		<Container>
			{!attempt && (
				<LinkTo.Name name="site-admins.config.webhooks">
					<Icons.Chevron.Left />
					<span>{t('back')}</span>
				</LinkTo.Name>
			)}
			{attempt && (
				<LinkTo.Path to={match.url.replace(attempt, '')}>
					<Icons.Chevron.Left />
					<span>{t('detail')}</span>
				</LinkTo.Path>
			)}
		</Container>
	);
}
