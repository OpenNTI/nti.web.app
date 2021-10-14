import { scoped } from '@nti/lib-locale';
import { DataContext } from '@nti/web-core/data';
import { LinkTo } from '@nti/web-routing';
import { Box, Icons, Text } from '@nti/web-core';

import { Store as Store } from './Store';

const t = scoped('nti-web-app.admin.config.Webhooks', {
	title: 'Webhook Subscriptions',
	back: 'Back to Subscriptions',
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

export const Frame = ({ children, ...props }) => {
	return (
		<Box p="lg" sh="sm">
			{children && (
				<Header>
					<LinkTo.Name name="site-admins.config.webhooks">
						<Icons.Chevron.Left />
						<span>{t('back')}</span>
					</LinkTo.Name>
				</Header>
			)}
			<Text as="h1">{t('title')}</Text>
			<DataContext store={Store.useStore()} fallback={<div />}>
				{children}
			</DataContext>
		</Box>
	);
};
