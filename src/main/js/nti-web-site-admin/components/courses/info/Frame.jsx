import React from 'react';
import PropTypes from 'prop-types';
import {LinkTo} from 'nti-web-routing';
import {Loading, Layouts} from 'nti-web-commons';
import {scoped} from 'nti-lib-locale';
import {decodeFromURI} from 'nti-lib-ntiids';

import Store from './Store';
import NavBar from './nav-bar';

const DEFAULT_TEXT = {
	back: 'Back to Courses'
};
const t = scoped('nti-site-admin.courses.info.Frame', DEFAULT_TEXT);

@Store.connect({course: 'course', loading: 'loading'})
export default class SiteAdminCourseView extends React.Component {
	static propTypes = {
		match: PropTypes.object,

		course: PropTypes.object,
		loading: PropTypes.bool,
		store: PropTypes.object,

		children: PropTypes.element
	}

	get store () {
		return this.props.store;
	}


	getCourseID (props = this.props) {
		const {match} = props;
		const {params} = match || {};
		const {id} = params || {};

		return decodeFromURI(id);
	}


	componentWillReceiveProps (nextProps) {
		const newID = this.getCourseID(nextProps);
		const oldID = this.getCourseID(this.props);

		if (newID !== oldID) {
			this.store.loadUser(newID);
		}
	}


	componentDidMount () {
		const id = this.getCourseID();

		this.store.loadCourse(id);
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
		const id = this.getCourseID();

		if (!course) {
			return null;
		}

		return (
			<Layouts.NavContent.Container>
				<Layouts.NavContent.Nav className="nav-bar">
					{this.renderHeader()}
					<NavBar course={course} id={id} />
				</Layouts.NavContent.Nav>
				<Layouts.NavContent.Content className="content">
					{React.Children.map(children, (item) => {
						return React.cloneElement(item, {routeProps: {course}});
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
