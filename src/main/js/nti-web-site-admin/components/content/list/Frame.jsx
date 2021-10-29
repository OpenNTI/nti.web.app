import React from 'react';

import { Layouts, FixedElement } from '@nti/web-commons';

import NavBar from './nav-bar';

export default function SiteAdminContentListFrame({ children }) {
	return (
		<div
			className="site-admin-content-list-frame"
			css={css`
				margin-top: 20px;
			`}
		>
			<Layouts.NavContent.Container>
				<Layouts.NavContent.Nav className="nav-bar">
					{/* {this.renderHeader()} */}
					<FixedElement>
						<NavBar />
					</FixedElement>
				</Layouts.NavContent.Nav>
				<Layouts.NavContent.Content className="content">
					{React.Children.map(children, item => {
						return React.cloneElement(item);
					})}
				</Layouts.NavContent.Content>
			</Layouts.NavContent.Container>
		</div>
	);
}
