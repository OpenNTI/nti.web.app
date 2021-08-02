import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';

import { Layouts, FixedElement } from '@nti/web-commons';

import NavBar from './nav-bar';
import Store from './SharedStore';

const { table } = stylesheet`
	box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.24);
	background-color: white;
	position: relative;
`;

const Frame = styled.div`
	margin-top: 20px;
`;

const Nav = styled(NavBar)`
	background-color: white;
	box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.24);
	padding-bottom: 20px;
`;

class SiteAdminUserListFrame extends React.Component {
	static propTypes = {
		children: PropTypes.node,
	};

	render() {
		const { children } = this.props;

		return (
			<Frame className="site-admin-user-list-frame">
				<Layouts.NavContent.Container>
					<Layouts.NavContent.Nav className="nav-bar">
						{/* {this.renderHeader()} */}
						<FixedElement>
							<Nav />
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
}

export default Store.compose(SiteAdminUserListFrame);
