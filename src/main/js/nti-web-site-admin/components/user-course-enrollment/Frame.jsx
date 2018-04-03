import React from 'react';
import PropTypes from 'prop-types';
import {LinkTo} from 'nti-web-routing';// eslint-disable-line
import {Loading, Layouts} from 'nti-web-commons';
import {scoped} from 'nti-lib-locale';

import Store from './Store';
import NavBar from './nav-bar';

const DEFAULT_TEXT = {
	backToUser: 'Back to User',
	backToCourse: 'Back to Course'
};

const t = scoped('nti-site-admin.users.user.user-course-enrollment.Frame', DEFAULT_TEXT);

@Store.connect({enrollment: 'enrollment', loading: 'loading', course: 'course'})
export default class SiteAdminUserEnrollmentView extends React.Component {
	static propTypes = {
		enrollmentID: PropTypes.string,
		courseContext: PropTypes.bool,
		userContext: PropTypes.bool,

		loading: PropTypes.bool,
		store: PropTypes.object,
		enrollment: PropTypes.object,
		course: PropTypes.object,

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
		const {children, enrollment, course} = this.props;

		return (
			<Layouts.NavContent.Container>
				<Layouts.NavContent.Nav className="nav-bar">
					{this.renderHeader()}
					<NavBar enrollment={enrollment}/>
				</Layouts.NavContent.Nav>
				<Layouts.NavContent.Content className="content">
					{React.Children.map(children, (item) => {
						return React.cloneElement(item, {enrollment, course});
					})}
				</Layouts.NavContent.Content>
			</Layouts.NavContent.Container>
		);
	}


	renderHeader () {
		const {courseContext} = this.props;
		const linkName = courseContext ? 'site-admin.courses.course-roster' : 'site-admin.users.user-overview';
		const label = courseContext ? t('backToCourse') : t('backToUser');

		return (
			<div className="header">
				<LinkTo.Name name={linkName}>
					<i className="icon-chevron-left" />
					<span>{label}</span>
				</LinkTo.Name>
			</div>
		);
	}
}
