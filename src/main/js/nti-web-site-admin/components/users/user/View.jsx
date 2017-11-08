import React from 'react';
import PropTypes from 'prop-types';
import {LinkTo, Router, Route} from 'nti-web-routing';// eslint-disable-line
import {Loading, Avatar} from 'nti-web-commons';

import Overview from './overview';
import Reports from './reports';
import Transcript from './transcript';
import Store from './Store';

@Router.connect(
	Route({path: '/transcript', component: Transcript, name: 'site-admin.users.user-transcript'}),
	Route({path: '/reports', component: Reports, name: 'site-admin.users.user-overview'}),
	Route({path: '/', component: Overview, name: 'site-admin.users.user-overview'})
)
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

		return  (
			<div className="container">
				<Avatar entity={user} />
				<div className="links">
					<LinkTo.Path to={`${id}/transcript`}>
						Transcripts
					</LinkTo.Path>
					<LinkTo.Path to={`${id}/reports`}>
						Reports
					</LinkTo.Path>
					<LinkTo.Path to={`${id}/`}>
						Overview
					</LinkTo.Path>
				</div>
				{React.Children.only(this.props.children)}
			</div>
		);
	}
}
