import React from 'react';
import PropTypes from 'prop-types';
import {LinkTo} from 'nti-web-routing';// eslint-disable-line
import {Loading, Layouts} from 'nti-web-commons';
import {scoped} from 'nti-lib-locale';

import Store from './Store';
import NavBar from './nav-bar';

const DEFAULT_TEXT = {
	back: 'Back to User'
};

const t = scoped('nti-site-admin.users.user.user-course-enrollment.Frame', DEFAULT_TEXT);

@Store.connect({enrollment: 'enrollment', loading: 'loading'})
export default class SiteAdminUserEnrollmentView extends React.Component {
	static propTypes = {
		enrollmentID: PropTypes.string,
		loading: PropTypes.bool,
		store: PropTypes.object,

		enrollment: PropTypes.object,

		children: PropTypes.node
	}

	get store () {
		return this.props.store;
	}


	componentWillReceiveProps (nextProps) {
		const {enrollmentID: newID} = nextProps;
		const {enrollmentID: oldID} = this.props;

		if (newID !== oldID) {
			this.store.loadEnrollment(newID);
		}
	}


	componentDidMount () {
		const {enrollmentID} = this.props;

		this.store.loadEnrollment(enrollmentID);
	}


	render () {
		const {loading} = this.props;

		return (
			<div className="site-admin-user-enrollment-view">
				{loading && this.renderHeader()}
				{loading && (<Loading.Mask />)}
				{!loading && this.renderUser()}
			</div>
		);

	}

	renderUser () {
		const {children, enrollment} = this.props;

		return (
			<Layouts.NavContent.Container>
				<Layouts.NavContent.Nav className="nav-bar">
					{this.renderHeader()}
					<NavBar enrollment={enrollment}/>
				</Layouts.NavContent.Nav>
				<Layouts.NavContent.Content className="content">
					{React.Children.map(children, (item) => {
						return React.cloneElement(item, {enrollment});
					})}
				</Layouts.NavContent.Content>
			</Layouts.NavContent.Container>
		);
	}


	renderHeader () {
		return (
			<div className="header">
				<LinkTo.Name name="site-admin.users.user-overview">
					<i className="icon-chevron-left" />
					<span>{t('back')}</span>
				</LinkTo.Name>
			</div>
		);
	}
}
