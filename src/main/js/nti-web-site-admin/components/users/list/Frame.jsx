import React from 'react';
import cx from 'classnames';

import { Layouts, FixedElement } from '@nti/web-commons';

import NavBar from './nav-bar';
import Store from './SharedStore';

const table = css`
	box-shadow: 0 1px 3px 0 rgba(0 0 0 24%);
	position: relative;
	padding-bottom: 20px;
`;

const Frame = styled.div`
	margin-top: 20px;
`;

function SiteAdminUserListFrame({ children }) {
	return (
		<Frame className="site-admin-user-list-frame">
			<Layouts.NavContent.Container>
				<Layouts.NavContent.Nav className="nav-bar">
					<FixedElement>
						<NavBar />
					</FixedElement>
				</Layouts.NavContent.Nav>
				<Layouts.NavContent.Content className="content">
					{React.Children.map(children, item =>
						React.cloneElement(item, {
							className: cx(item.props.className, table),
						})
					)}
				</Layouts.NavContent.Content>
			</Layouts.NavContent.Container>
		</Frame>
	);
}

export default Store.compose(SiteAdminUserListFrame);
