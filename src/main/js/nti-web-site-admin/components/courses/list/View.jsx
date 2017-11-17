import React from 'react';
import PropTypes from 'prop-types';
// import { Editor, CourseCard } from 'nti-web-course';
import { Loading } from 'nti-web-commons';
// import { getService}  from 'nti-web-client';
import { scoped } from 'nti-lib-locale';
import { LinkTo } from 'nti-web-routing';// eslint-disable-line

import Store from './Store';

const DEFAULT_TEXT = {
	createSuccess: 'Course was successfully created'
};

const t = scoped('siteadmin.components.course.view', DEFAULT_TEXT);

@Store.connect({items: 'items', loading: 'loading'})
export default class View extends React.Component {
	static propTypes = {
		store: PropTypes.object,
		items: PropTypes.array,
		loading: PropTypes.bool,
		error: PropTypes.any
	}

	constructor (props) {
		super(props);

		this.state = {};

		props.store.load();
	}

	launch = () => {
		// Editor.createCourse()
		// 	.then(() => {
		// 		// course created
		// 		this.setState({createInProgress: true});

		// 		setTimeout(() => { this.setState({createInProgress: false}); }, 1500);
		// 	});
	};

	renderCreateButton () {
		return (<div className="create-course-button" onClick={this.launch}>Create New Course</div>);
	}

	renderCreateMessage () {
		return (<div className="course-create-message">{t('createSuccess')}</div>);
	}

	renderCourse = (course) => {
		// const showEditor = () => {
		// 	// Editor.editCourse(course);
		// };

		return (
			<LinkTo.Path to={`${course.getID()}/`}>
				{/*<CourseCard key={course.ProviderUniqueID} course={course} onEdit={showEditor} isAdministrative/>*/}
			</LinkTo.Path>
		);
	}

	renderCourseItems () {
		if(this.props.loading) {
			return <Loading.Mask/>;
		}

		return (
			<div className="course-item-list admin">
				{(this.props.items || []).map(this.renderCourse)}
			</div>
		);
	}

	renderListing () {
		return this.state.createInProgress
			? this.renderCreateMessage()
			: this.renderCourseItems();
	}

	render () {
		return (<div className="course-admin">
			{this.renderCreateButton()}
			{this.renderListing()}
		</div>);
	}
}
