import React from 'react';
import PropTypes from 'prop-types';
import {LinkTo, Router, Route} from 'nti-web-routing';// eslint-disable-line

import Overview from './overview';
import Reports from './reports';
import Transcript from './transcript';


const Routes = Router.for(
	Route({path: '/transcript', component: Transcript, name: 'site-admin.users.user-transcript'}),
	Route({path: '/reports', component: Reports, name: 'site-admin.users.user-overview'}),
	Route({path: '/', component: Overview, name: 'site-admin.users.user-overview'})
);

export default class SiteAdminUserView extends React.Component {
	static Router = Routes.Router;

	static propTypes = {
		match: PropTypes.object
	}

	render () {
		const {match} = this.props;
		const {params} = match || {};
		const {id} = params || {};

		return  (
			<div className="site-admin-user-view">
				<div className="header">
					<LinkTo.Name name="site-admin.users">
						Back To Users
					</LinkTo.Name>
					<span>{id}</span>
				</div>
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
				<Routes match={match} />
			</div>
		);
	}
}
