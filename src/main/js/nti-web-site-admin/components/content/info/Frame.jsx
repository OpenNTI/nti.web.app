import React from 'react';
import PropTypes from 'prop-types';
import {LinkTo} from '@nti/web-routing';
import {Loading, Layouts} from '@nti/web-commons';
import {scoped} from '@nti/lib-locale';
import {decodeFromURI} from '@nti/lib-ntiids';

import {getString} from 'legacy/util/Localization';

import Store from './Store';
import NavBar from './nav-bar';

const DEFAULT_TEXT = {
	back: getString('NextThought.view.Navigation.back')
};
const t = scoped('nti-site-admin.courses.info.Frame', DEFAULT_TEXT);

@Store.connect({course: 'course', loading: 'loading'})
export default class SiteAdminCourseView extends React.Component {
	static propTypes = {
		courseID: PropTypes.string.isRequired,

		course: PropTypes.object,
		loading: PropTypes.bool,
		store: PropTypes.object,

		children: PropTypes.element
	}

	get store () {
		return this.props.store;
	}


	getCourseID (props = this.props) {
		const {courseID} = props;

		return decodeFromURI(courseID);
	}


	componentDidMount () {
		this.store.loadCourse(this.getCourseID());
	}


	componentDidUpdate (prevProps) {
		const newID = this.getCourseID(this.props);
		const oldID = this.getCourseID(prevProps);

		if (newID !== oldID) {
			this.store.loadUser(newID);
		}
	}


	render () {
		const {loading} = this.props;

		return (
			<div className="site-admin-course-view">
				{loading && this.renderHeader()}
				{loading && (<Loading.Mask />)}
				{!loading && this.renderCourse()}
			</div>
		);
	}


	renderCourse () {
		const {course, children} = this.props;

		if (!course) {
			return null;
		}

		return (
			<Layouts.NavContent.Container>
				<Layouts.NavContent.Nav className="nav-bar">
					{this.renderHeader()}
					<NavBar course={course} />
				</Layouts.NavContent.Nav>
				<Layouts.NavContent.Content className="content">
					{React.Children.map(children, (item) => {
						return React.cloneElement(item, {course});
					})}
				</Layouts.NavContent.Content>
			</Layouts.NavContent.Container>
		);
	}

	renderHeader () {
		return (
			<div className="header">
				<LinkTo.Name name="site-admin.courses">
					<i className="icon-chevron-left" />
					<span>{t('back')}</span>
				</LinkTo.Name>
			</div>
		);
	}
}
