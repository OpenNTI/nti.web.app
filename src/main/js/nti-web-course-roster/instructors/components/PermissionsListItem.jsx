import React from 'react';
import PropTypes from 'prop-types';
import {Avatar, DisplayName, Checkbox} from 'nti-web-commons';

import {
	addInstructor,
	removeInstructor,
	addEditor,
	removeEditor
} from '../Actions';

export default class PermissionsListItem extends React.Component {
	static propTypes = {
		permissions: PropTypes.object,
		course: PropTypes.object
	}


	toggleInstructor = (e) => {
		const {permissions, course} = this.props;

		if (e.target.checked) {
			addInstructor(permissions, course);
		} else {
			removeInstructor(permissions, course);
		}
	}


	toggleEditor = (e) => {
		const {permissions, course} = this.props;

		if (e.target.checked) {
			addEditor(permissions, course);
		} else {
			removeEditor(permissions, course);
		}
	}


	render () {
		const {permissions} = this.props;
		const {user, isInstructor, isEditor} = permissions;

		return (
			<div className="course-instructors-permission-list-item">
				<div className="user">
					<Avatar className="avatar" entity={user} />
					<DisplayName className="display" entity={user} />
				</div>
				<div className="instructor-container">
					<Checkbox checked={isInstructor} onChange={this.toggleInstructor} />
				</div>
				<div className="editor-container">
					<Checkbox checked={isEditor} onChange={this.toggleEditor} />
				</div>
			</div>
		);
	}
}
