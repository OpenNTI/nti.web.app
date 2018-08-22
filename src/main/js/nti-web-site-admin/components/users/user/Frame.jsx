import React from 'react';
import PropTypes from 'prop-types';
import {LinkTo} from '@nti/web-routing';// eslint-disable-line
import {Loading, Layouts} from '@nti/web-commons';
import {scoped} from '@nti/lib-locale';

import Store from './Store';
import NavBar from './nav-bar';

const DEFAULT_TEXT = {
	back: 'Back to People'
};

const t = scoped('nti-site-admin.users.user.Frame', DEFAULT_TEXT);

@Store.connect({user: 'user', loading: 'loading', hasBooks: 'hasBooks', hasCourses: 'hasCourses'})
export default class SiteAdminUserView extends React.Component {
	static propTypes = {
		userID: PropTypes.string,

		user: PropTypes.object,
		hasBooks: PropTypes.bool,
		hasCourses: PropTypes.bool,
		loading: PropTypes.bool,
		store: PropTypes.object,

		children: PropTypes.node
	}


	get store () {
		return this.props.store;
	}


	componentDidUpdate (oldProps) {
		const {userID: newID} = this.props;
		const {userID: oldID} = oldProps;

		if (newID !== oldID) {
			this.store.loadUser(newID);
		}
	}


	componentDidMount () {
		const {userID} = this.props;

		this.store.loadUser(userID);
	}


	componentWillUnmount () {
		const {user} = this.props;

		this.store.unloadUser(user);
	}

	render () {
		const {loading} = this.props;

		return (
			<div className="site-admin-user-view">
				{loading && this.renderHeader()}
				{loading && (<Loading.Mask />)}
				{!loading && this.renderUser()}
			</div>
		);

	}

	renderUser () {
		const {user, hasBooks, hasCourses, children} = this.props;

		if (!user) {
			return null;
		}

		return (
			<Layouts.NavContent.Container>
				<Layouts.NavContent.Nav className="nav-bar">
					{this.renderHeader()}
					<NavBar user={user} hasBooks={hasBooks} hasCourses={hasCourses}/>
				</Layouts.NavContent.Nav>
				<Layouts.NavContent.Content className="content">
					{React.Children.map(children, (item) => {
						return React.cloneElement(item, {user});
					})}
				</Layouts.NavContent.Content>
			</Layouts.NavContent.Container>
		);
	}


	renderHeader () {
		return (
			<div className="header">
				<LinkTo.Name name="site-admin.users">
					<i className="icon-chevron-left" />
					<span>{t('back')}</span>
				</LinkTo.Name>
			</div>
		);
	}
}
