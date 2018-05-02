import React from 'react';
import PropTypes from 'prop-types';
import {LinkTo} from '@nti/web-routing';// eslint-disable-line
import {Layouts} from '@nti/web-commons';

import NavBar from './nav-bar';

export default class SiteAdminAdvancedView extends React.Component {
	static propTypes = {
		children: PropTypes.node
	}

	render () {
		return (
			<div className="advanced-admin-tools-view">
				{this.renderLayout()}
			</div>
		);

	}

	renderLayout () {
		const {children} = this.props;

		return (
			<Layouts.NavContent.Container>
				<Layouts.NavContent.Nav className="nav-bar">
					<NavBar/>
				</Layouts.NavContent.Nav>
				<Layouts.NavContent.Content className="content">
					{React.Children.map(children, (item) => {
						return React.cloneElement(item, {});
					})}
				</Layouts.NavContent.Content>
			</Layouts.NavContent.Container>
		);
	}
}
