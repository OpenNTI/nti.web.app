import React from 'react';
import PropTypes from 'prop-types';
import {Prompt} from 'nti-web-commons';

import {
	LOADING,
	PERMISSIONS_UPDATED
} from './Constants';
import {loadManagers} from './Actions';
import Store from './Store';


export default class CourseRoster extends React.Component {
	static show (course) {
		return new Promise((fulfill, reject) => {
			Prompt.modal(
				<CourseRoster
					course={course}
					onSelect={fulfill}
					onCancel={reject}
				/>,
				'course-roster-instructor-container'
			);
		});
	}

	static propTypes = {
		course: PropTypes.object
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
		} else if (data.type === PERMISSIONS_UPDATED) {
			this.onPermissionsUpdated();
		}
	}


	onPermissionsUpdated () {
		this.setState({
			loading: false,
			permissions: Store.permissions
		});
	}


	render () {
		const {loading, permissions} = this.state;

		if (permissions) {
			debugger;
		}

		return (
			<div>
				{loading && (<span>Loading</span>)}
				{(permissions || []).map((x, key) => (<span key={key}>{x.user.alias}</span>))}
			</div>
		);
	}
}
