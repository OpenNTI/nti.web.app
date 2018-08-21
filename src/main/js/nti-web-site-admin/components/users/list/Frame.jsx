import React from 'react';
import PropTypes from 'prop-types';
import {LinkTo} from '@nti/web-routing';// eslint-disable-line
import {Layouts, FixedElement} from '@nti/web-commons';

import NavBar from './nav-bar';

export default class SiteAdminUserListFrame extends React.Component {
	static propTypes = {
		children: PropTypes.node
	}

	render () {
		const {children} = this.props;

		return (
			<div className="site-admin-user-list-frame">
				<Layouts.NavContent.Container>
					<Layouts.NavContent.Nav className="nav-bar">
						{/* {this.renderHeader()} */}
						<FixedElement>
							<NavBar/>
						</FixedElement>
					</Layouts.NavContent.Nav>
					<Layouts.NavContent.Content className="content">
						{React.Children.map(children, (item) => {
							return React.cloneElement(item);
						})}
					</Layouts.NavContent.Content>
				</Layouts.NavContent.Container>
			</div>
		);
	}
}
