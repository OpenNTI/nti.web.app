import React from 'react';
import PropTypes from 'prop-types';
import {Prompt, Loading, DialogButtons} from 'nti-web-commons';
import {scoped} from 'nti-lib-locale';

import {
	LOADING,
	LIST_UPDATED
} from './Constants';
import {loadManagers} from './Actions';
import Store from './Store';
import PermissionsList from './components/PermissionsList';

const DEFAULT_TEXT = {
	done: 'Done'
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


	render () {
		const {loading, permissionsList} = this.state;
		const buttons = [
			{label: t('done'), onClick: this.onDismiss}
		];

		return (
			<div className="course-roster-instructors">
				<div className="permissions-list-container">
					{loading && (<Loading.Mask />)}
					{permissionsList && !loading && (<PermissionsList permissionsList={permissionsList} />)}
				</div>
				<DialogButtons buttons={buttons} />
			</div>
		);
	}
}
