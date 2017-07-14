import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';

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
		course: PropTypes.object,
		updating: PropTypes.bool,
		showInstructor: PropTypes.bool,
		showEditor: PropTypes.bool
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
		const {permissions, updating, showEditor, showInstructor} = this.props;
		const {user} = permissions;
		const cls = cx('course-instructors-permission-list-item', {updating});

		return (
			<div className={cls}>
				<div className="user">
					<Avatar className="avatar" entity={user} />
					<DisplayName className="display" entity={user} />
				</div>
				{showInstructor && this.renderInstructor(permissions)}
				{showEditor && this.renderEditor(permissions)}
			</div>
		);
	}

	renderInstructor = (permissions) => {
		const {isInstructor} = permissions;

		return (
			<div className="instructor-container">
				<Checkbox checked={isInstructor} onChange={this.toggleInstructor} />
			</div>
		);
	}


	renderEditor = (permissions) => {
		const {isEditor} = permissions;

		return (
			<div className="editor-container">
				<Checkbox checked={isEditor} onChange={this.toggleEditor} />
			</div>
		);
	}
}
