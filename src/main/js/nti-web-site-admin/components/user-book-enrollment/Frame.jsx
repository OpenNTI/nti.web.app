import React from 'react';
import PropTypes from 'prop-types';
import {LinkTo} from '@nti/web-routing';// eslint-disable-line
import {Loading, Layouts} from '@nti/web-commons';
import {scoped} from '@nti/lib-locale';

import Store from './Store';
import NavBar from './nav-bar';

const DEFAULT_TEXT = {
	backToUser: 'Back to User',
	backToCourse: 'Back to Book'
};

const t = scoped('nti-site-admin.users.user.user-book-enrollment.Frame', DEFAULT_TEXT);

@Store.connect({userBookRecord: 'userBookRecord', loading: 'loading'})
export default class SiteAdminUserEnrollmentView extends React.Component {
	static propTypes = {
		bookID: PropTypes.string,
		userID: PropTypes.string,
		courseContext: PropTypes.bool,
		userContext: PropTypes.bool,

		loading: PropTypes.bool,
		store: PropTypes.object,
		userBookRecord: PropTypes.object,

		children: PropTypes.node
	}

	get store () {
		return this.props.store;
	}


	componentDidUpdate (oldProps) {
		const {bookID: oldID} = oldProps;
		const {bookID: newID, userID} = this.props;

		if (newID !== oldID) {
			this.store.loadBook(newID, userID);
		}
	}


	componentDidMount () {
		const {bookID, userID} = this.props;

		this.store.loadBook(bookID, userID);
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
		const {children, userBookRecord} = this.props;

		return (
			<Layouts.NavContent.Container>
				<Layouts.NavContent.Nav className="nav-bar">
					{this.renderHeader()}
					<NavBar book={userBookRecord && userBookRecord.Bundle} user={userBookRecord && userBookRecord.User}/>
				</Layouts.NavContent.Nav>
				<Layouts.NavContent.Content className="content">
					{React.Children.map(children, (item) => {
						return React.cloneElement(item, {userBookRecord});
					})}
				</Layouts.NavContent.Content>
			</Layouts.NavContent.Container>
		);
	}


	renderHeader () {
		const {courseContext} = this.props;
		const linkName = courseContext ? 'site-admin.courses.book-roster' : 'site-admin.users.user-overview';
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
