import React from 'react';
import PropTypes from 'prop-types';
import {Avatar, DisplayName, Checkbox} from 'nti-web-commons';

export default class PermissionsListItem extends React.Component {
	static propTypes = {
		permissions: PropTypes.object
	}


	toggleInstructor = () => {

	}


	toggleEditor = () => {

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
					<Checkbox checked={isInstructor} />
				</div>
				<div className="editor-container">
					<Checkbox checked={isEditor} />
				</div>
			</div>
		);
	}
}
