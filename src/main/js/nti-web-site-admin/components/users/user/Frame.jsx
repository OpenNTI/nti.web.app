import React from 'react';

import { LinkTo } from '@nti/web-routing';
import { Loading, Layouts } from '@nti/web-commons';
import { scoped } from '@nti/lib-locale';
import { DataContext } from '@nti/web-core/data';

import { Store } from './Store';
import NavBar from './nav-bar';

const DEFAULT_TEXT = {
	back: 'Back to People',
};

const t = scoped('nti-site-admin.users.user.Frame', DEFAULT_TEXT);

export default function SiteAdminUserView({ userID, ...props }) {
	const store = Store.useStore({ userID });

	return (
		<div
			className="site-admin-user-view"
			css={css`
				min-height: 200px;
			`}
		>
			<DataContext
				store={store}
				fallback={
					<>
						<Header />
						<Loading.Mask />
					</>
				}
			>
				<User {...props} />
			</DataContext>
		</div>
	);
}

function User({ children }) {
	const { user } = Store.useProperties();
	if (!user) {
		return null;
	}

	return (
		<Layouts.NavContent.Container>
			<Layouts.NavContent.Nav
				className="nav-bar"
				css={css`
					margin-right: 10px;
				`}
			>
				<Header />
				<NavBar user={user} />
			</Layouts.NavContent.Nav>
			<Layouts.NavContent.Content
				className="content"
				css={css`
					/* the height of the header */
					padding-top: 3.375rem;
				`}
			>
				{React.Children.map(children, item =>
					React.cloneElement(item, { user })
				)}
			</Layouts.NavContent.Content>
		</Layouts.NavContent.Container>
	);
}

function Header() {
	return (
		<div
			className="header"
			css={css`
				font-size: 1rem;
				padding: 1rem 0;

				a {
					text-decoration: none;
					color: var(--primary-grey);
					display: flex;
					align-items: center;
				}
			`}
		>
			<LinkTo.Path to="../..">
				<i
					className="icon-chevron-left"
					css={css`
						font-size: 0.875rem;
						font-weight: 700;
						width: 1rem;
					`}
				/>
				<span>{t('back')}</span>
			</LinkTo.Path>
		</div>
	);
}
