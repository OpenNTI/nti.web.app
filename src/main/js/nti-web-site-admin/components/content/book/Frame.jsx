import React from 'react';
import PropTypes from 'prop-types';
import {LinkTo} from 'nti-web-routing';
import {Loading, Layouts} from 'nti-web-commons';
import {scoped} from 'nti-lib-locale';
import {decodeFromURI} from 'nti-lib-ntiids';

import Store from '../info/Store';

import NavBar from './nav-bar';

const DEFAULT_TEXT = {
	back: 'Back to Books'
};
const t = scoped('nti-site-admin.courses.book.Frame', DEFAULT_TEXT);

@Store.connect({course: 'course', loading: 'loading'})
export default class SiteAdminBookView extends React.Component {
	static propTypes = {
		bookID: PropTypes.string.isRequired,

		course: PropTypes.object,
		loading: PropTypes.bool,
		store: PropTypes.object,

		children: PropTypes.element
	}

	get store () {
		return this.props.store;
	}


	getCourseID (props = this.props) {
		const {bookID} = props;

		return decodeFromURI(bookID);
	}


	componentWillReceiveProps (nextProps) {
		const newID = this.getCourseID(nextProps);
		const oldID = this.getCourseID(this.props);

		if (newID !== oldID) {
			this.store.loadUser(newID);
		}
	}


	componentDidMount () {
		this.store.loadCourse(this.getCourseID());
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
					<NavBar book={course} />
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