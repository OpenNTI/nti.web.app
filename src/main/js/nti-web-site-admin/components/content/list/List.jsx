import React from 'react';
import PropTypes from 'prop-types';
import {scoped} from 'nti-lib-locale';
import {contextual} from 'nti-web-search';
import {LinkTo} from 'nti-web-routing';

import SearchablePagedView from '../../common/SearchablePagedView';

import Item from './Item';

const DEFAULT_TEXT = {
	courses: 'Courses',
	createSuccess: 'Course was successfully created',
	empty: 'No Courses',
	emptySearch: 'No courses found. Please refine your search.',
	backLabel: 'View all Courses',
	error: 'Unable to load courses.'
};
const t = scoped('siteadmin.components.course.view', DEFAULT_TEXT);

@contextual(t('courses'))
export default class View extends React.Component {
	static propTypes = {
		selectedItems: PropTypes.object,
		loadNextPage: PropTypes.func,
		searchTerm: PropTypes.string,
		addCmp: PropTypes.func,
		removeCmp: PropTypes.func,
		onSelectionChange: PropTypes.func,
		total: PropTypes.number,
		loading: PropTypes.bool,
		isSelectable: PropTypes.bool
	}

	onLoadNextPage = () => {
		this.props.loadNextPage();
	}

	render () {
		return (
			<div className="site-admin-course">
				<div className="course-list">
					<SearchablePagedView
						{...this.props}
						className="site-admin-course-list"
						renderItem={this.renderItem}
						loadNextPage={this.onLoadNextPage}
						getString={t}
					/>
				</div>
			</div>
		);
	}


	renderItem = (item) => {
		return (
			<LinkTo.Object object={item} context="site-admin.course-list-item">
				<Item item={item} />
			</LinkTo.Object>
		);
	}

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
