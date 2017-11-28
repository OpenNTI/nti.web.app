import React from 'react';
// import PropTypes from 'prop-types';
import {scoped} from 'nti-lib-locale';
import {searchable, contextual} from 'nti-web-search';
import {LinkTo} from 'nti-web-routing';

import SearchablePagedView from '../../common/SearchablePagedView';

import Store from './Store';
import Item from './Item';

const DEFAULT_TEXT = {
	courses: 'Courses',
	createSuccess: 'Course was successfully created',
	empty: 'No Courses',
	emptySearch: 'No Courses found. Please refine your search.',
	backLabel: 'View all Courses',
	error: 'Unable to load Users.'
};
const t = scoped('siteadmin.components.course.view', DEFAULT_TEXT);

const store = new Store();
const propMap = {
	items: 'items',
	searchTerm: 'searchTerm',
	loading: 'loading',
	hasNextPage: 'hasNextPage',
	loadingNextPage: 'loadingNextPage',
	error: 'error'
};

@contextual(t('courses'))
@searchable(store, propMap)
export default class View extends React.Component {

	componentDidMount () {
		store.load();
	}


	onLoadNextPage = () => {
		store.loadNextPage();
	}


	render () {
		return (
			<div className="site-admin-course">
				<SearchablePagedView
					{...this.props}
					className="site-admin-course-list"
					renderItem={this.renderItem}
					loadNextPage={this.onLoadNextPage}
					getString={t}
				/>
			</div>
		);
	}


	renderItem = (item) => {
		const {CourseInstance:course} = item;

		return (
			<LinkTo.Object object={course} context="site-admin.course-list-item">
				<Item item={course} />
			</LinkTo.Object>
		);
	}



	// launch = () => {
	// 	// Editor.createCourse()
	// 	// 	.then(() => {
	// 	// 		// course created
	// 	// 		this.setState({createInProgress: true});

	// 	// 		setTimeout(() => { this.setState({createInProgress: false}); }, 1500);
	// 	// 	});
	// };

	// renderCreateButton () {
	// 	return (<div className="create-course-button" onClick={this.launch}>Create New Course</div>);
	// }

	// renderCreateMessage () {
	// 	return (<div className="course-create-message">{t('createSuccess')}</div>);
	// }

	// renderCourse = (course) => {
	// 	// const showEditor = () => {
	// 	// 	// Editor.editCourse(course);
	// 	// };

	// 	return (
	// 		<LinkTo.Path to={`${course.getID()}/`}>
	// 			{/*<CourseCard key={course.ProviderUniqueID} course={course} onEdit={showEditor} isAdministrative/>*/}
	// 		</LinkTo.Path>
	// 	);
	// }

	// renderCourseItems () {
	// 	if(this.props.loading) {
	// 		return <Loading.Mask/>;
	// 	}

	// 	return (
	// 		<div className="course-item-list admin">
	// 			{(this.props.items || []).map(this.renderCourse)}
	// 		</div>
	// 	);
	// }

	// renderListing () {
	// 	return this.state.createInProgress
	// 		? this.renderCreateMessage()
	// 		: this.renderCourseItems();
	// }

	// render () {
	// 	return (<div className="course-admin">
	// 		{this.renderCreateButton()}
	// 		{this.renderListing()}
	// 	</div>);
	// }
}
