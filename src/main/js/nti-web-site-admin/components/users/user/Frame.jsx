import React from 'react';
import PropTypes from 'prop-types';
import {LinkTo} from 'nti-web-routing';// eslint-disable-line
import {Loading, Layouts} from 'nti-web-commons';

import Store from './Store';
import NavBar from './nav-bar';

@Store.connect({user: 'user'})
export default class SiteAdminUserView extends React.Component {
	static propTypes = {
		match: PropTypes.object,
		user: PropTypes.object,
		loading: PropTypes.bool,
		store: PropTypes.object,

		children: PropTypes.node
	}


	get store () {
		return this.props.store;
	}

	getUserID (props = this.props) {
		const {match} = props;
		const {params} = match || {};
		const {id} = params || {};

		return id;
	}


	componentWillReceiveProps (nextProps) {
		const newID = this.getUserID(nextProps);
		const oldID = this.getUserID(this.props);

		if (newID !== oldID) {
			this.store.loadUser(newID);
		}
	}


	componentDidMount () {
		const id = this.getUserID();

		this.store.loadUser(id);
	}


	componentWillUnmount () {
		const {user} = this.props;

		this.store.unloadUser(user);
	}

	render () {
		const {loading} = this.props;

		return (
			<div className="site-admin-user-view">
				<div className="header">
					<LinkTo.Name name="site-admin.users">
						Back To Users
					</LinkTo.Name>
				</div>
				{loading && (<Loading.Mask />)}
				{!loading && this.renderUser()}
			</div>
		);

	}

	renderUser () {
		const {user} = this.props;
		const id = this.getUserID();

		return (
			<Layouts.NavContent.Container>
				<Layouts.NavContent.Nav className="nav-bar">
					<NavBar user={user} id={id} />
				</Layouts.NavContent.Nav>
				<Layouts.NavContent.Content>
					{React.Children.only(this.props.children)}
				</Layouts.NavContent.Content>
			</Layouts.NavContent.Container>
		);
	}
}
