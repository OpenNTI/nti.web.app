import React from 'react';
import PropTypes from 'prop-types';
import {LinkTo} from '@nti/web-routing';
import {Loading, Layouts} from '@nti/web-commons';
import {scoped} from '@nti/lib-locale';
import {decodeFromURI} from '@nti/lib-ntiids';

import Store from '../info/Store';

import NavBar from './nav-bar';

const DEFAULT_TEXT = {
	back: 'Back to Books'
};
const t = scoped('nti-site-admin.courses.book.Frame', DEFAULT_TEXT);

export default
@Store.connect({course: 'course', loading: 'loading'})
class SiteAdminBookView extends React.Component {
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
				<LinkTo.Name name="site-admin.content.content-list-books">
					<i className="icon-chevron-left" />
					<span>{t('back')}</span>
				</LinkTo.Name>
			</div>
		);
	}
}
