import React from 'react';
import PropTypes from 'prop-types';
import {Editor} from '@nti/web-course';
import {getService} from '@nti/web-client';

import Toolbar from '../../common/toolbar/Toolbar';

import CourseList from './CourseList';
import BookList from './BookList';
import CourseStore from './CourseStore';

const BOOKS = 'books';
const COURSES = 'courses';

const OPTIONS = {[BOOKS]: 'Books', [COURSES]: 'Courses'};

// TODO: Maybe need to genericize this if we add support for book creation
const store = CourseStore.getInstance();

export default class FilterableContentList extends React.Component {
	static propTypes = {
		searchTerm: PropTypes.string
	}

	constructor (props) {
		super(props);

		this.state = {
			type: localStorage.getItem('admin-content-type') || COURSES,
			selectedItems: new Set()
		};
	}

	onTypeToggle = (val) => {
		if(val === OPTIONS[COURSES]) {
			if(this.state.type !== COURSES) {
				localStorage.setItem('admin-content-type', COURSES);
				this.setState({selectedItems: new Set(), type: COURSES});
			}
		}
		else if(val === OPTIONS[BOOKS]) {
			if(this.state.type !== BOOKS) {
				localStorage.setItem('admin-content-type', BOOKS);
				this.setState({selectedItems: new Set(), type: BOOKS});
			}
		}
	}

	async onCourseCreated (catalogEntry) {
		const accessLink = catalogEntry.getLink('UserCoursePreferredAccess');

		if(accessLink) {
			const service = await getService();
			const storeObject = await service.get(accessLink);
			const parsed = await service.getObject(storeObject);

			store.insert(parsed);
		}
	}

	launch = () => {
		Editor.createCourse()
			.then((createdEntry) => {
				// course created
				this.onCourseCreated(createdEntry);
			});
	};

	renderToolbar () {
		const {type, selectedItems} = this.state;

		let selectedType = OPTIONS[type];
		let onCreate = null;

		if(type === COURSES) {
			onCreate = this.launch;
		}

		return (
			<Toolbar
				className="admin-content-toolbar"
				onTypeToggle={this.onTypeToggle}
				selectedType={selectedType}
				options={Object.values(OPTIONS)}
				//sorters={sorters} // sorters not supported yet
				selectedItems={selectedItems}
				onCreate={onCreate}
			/>
		);
	}

	onSelectionChange = (item, isSelected) => {
		const { selectedItems } = this.state;

		if(isSelected) {
			selectedItems.add(item);
		}
		else {
			selectedItems.delete(item);
		}

		this.setState({selectedItems});
	}

	render () {
		const {type, selectedItems} = this.state;

		const Cmp = type === COURSES ? CourseList : BookList;

		return (
			<div className="filterable-list">
				{this.renderToolbar()}
				<Cmp onSelectionChange={this.onSelectionChange} selectedItems={selectedItems}/>
			</div>
		);
	}
}
