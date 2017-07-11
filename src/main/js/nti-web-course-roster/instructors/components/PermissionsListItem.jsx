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
					<Avatar entity={user} />
					<DisplayName entity={user} />
				</div>
				<Checkbox checked={isInstructor} />
				<Checkbox checked={isEditor} />
			</div>
		);
	}
}
