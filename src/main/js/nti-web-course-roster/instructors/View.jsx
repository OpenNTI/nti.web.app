import React from 'react';
import PropTypes from 'prop-types';
import {scoped} from 'nti-lib-locale';

import {Prompt, Loading, DialogButtons, Search, Panels} from 'nti-web-commons';

import {
	LOADING,
	SEARCHING,
	ERROR,
	LIST_UPDATED,
	USER_UPDATING
} from './Constants';
import {loadManagers, searchUsers} from './Actions';
import Store from './Store';
import PermissionsList from './components/PermissionsList';

const DEFAULT_TEXT = {
	searching: 'Searching',
	error: 'Unable to update permissions',
	title: 'Manage Instructors'
};

const t = scoped('nti-course-roster.instructors.view', DEFAULT_TEXT);


export default class CourseRoster extends React.Component {
	static show (course) {
		return new Promise((fulfill, reject) => {
			Prompt.modal(
				<CourseRoster
					course={course}
					onSelect={fulfill}
					onCancel={reject}
				/>,
				'course-roster-instructors-container'
			);
		});
	}

	static propTypes = {
		course: PropTypes.object,
		onDismiss: PropTypes.func
	}


	state = {}

	componentDidMount () {
		const {course} = this.props;

		Store.addChangeListener(this.onStoreChange);
		loadManagers(course);
	}

	componentWillUnmount () {
		Store.removeChangeListener(this.onStoreChange);
	}

	onStoreChange = (data) => {
		if (data.type === LOADING) {
			this.setState({loading: true});
		} else if (data.type === SEARCHING) {
			this.setState({searching: true});
		} else if (data.type === ERROR) {
			this.setState({error: Store.error});
		} else if (data.type === USER_UPDATING) {
			this.setState({updatingUsers: Store.updatingUsers});
		} else if (data.type === LIST_UPDATED) {
			this.onListUpdated();
		}
	}


	onListUpdated () {
		this.setState({
			loading: false,
			searching: false,
			permissionsList: Store.permissionsList
		});
	}


	onDismiss = () => {
		const {onDismiss} = this.props;

		if (onDismiss) {
			onDismiss();
		}
	}


	onSearchChange = (value) => {
		searchUsers(value);
	}


	render () {
		const {course, onDismiss} = this.props;
		const {loading, searching, permissionsList, error, updatingUsers} = this.state;

		return (
			<div className="course-roster-instructors">
				<div className="title">
					<Panels.TitleBar title={t('title')} iconAction={onDismiss} />
				</div>
				{error && (<div className="error">{error.message || t('error')}</div>)}
				<div className="permissions-list-container">
					{loading && (<Loading.Mask />)}
					{searching && (<Loading.Mask message={t('searching')}/>)}
					{!loading && (<div className="search-container"><Search onChange={this.onSearchChange} /></div>)}
					{permissionsList && !searching && !loading && (<PermissionsList permissionsList={permissionsList} course={course} updatingUsers={updatingUsers} />)}
				</div>
			</div>
		);
	}
}
