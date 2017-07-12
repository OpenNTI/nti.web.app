import React from 'react';
import PropTypes from 'prop-types';
import {Prompt, Loading, DialogButtons, Search} from 'nti-web-commons';
import {scoped} from 'nti-lib-locale';

import {
	LOADING,
	SEARCHING,
	ERROR,
	LIST_UPDATED
} from './Constants';
import {loadManagers, searchUsers} from './Actions';
import Store from './Store';
import PermissionsList from './components/PermissionsList';

const DEFAULT_TEXT = {
	done: 'Done',
	searching: 'Searching',
	error: 'Unable to update permissions'
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
		const {course} = this.props;
		const {loading, searching, permissionsList, error} = this.state;
		const buttons = [
			{label: t('done'), onClick: this.onDismiss}
		];

		return (
			<div className="course-roster-instructors">
				{error && (<div className="error">{error.message || t('error')}</div>)}
				{!loading && (<div className="search-container"><Search onChange={this.onSearchChange} /></div>)}
				<div className="permissions-list-container">
					{loading && (<Loading.Mask />)}
					{searching && (<Loading.Mask message={t('searching')}/>)}
					{permissionsList && !searching && !loading && (<PermissionsList permissionsList={permissionsList} course={course} />)}
				</div>
				<DialogButtons buttons={buttons} />
			</div>
		);
	}
}
