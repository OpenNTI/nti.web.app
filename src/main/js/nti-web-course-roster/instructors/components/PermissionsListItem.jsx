import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import {getAppUsername} from 'nti-web-client';
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
		const isMe = getAppUsername() === user.getID();
		const cls = cx('course-instructors-permission-list-item', {updating});
		const userID = user.getID && user.getID() || user.ID;
		const userEmail = user.email;
		const metaIDCmp = userID ? (<div className="display meta">{userID}</div>) : null;
		const metaEmailCmp = userEmail ? (<div className="display meta">{userEmail}</div>) : null;

		return (
			<div className={cls}>
				<div className="user">
					<Avatar className="avatar" entity={user} />
					<DisplayName className="display" entity={user} />
					{metaIDCmp}
					{metaEmailCmp}
				</div>
				{showInstructor && this.renderInstructor(permissions, isMe)}
				{showEditor && this.renderEditor(permissions, isMe)}
			</div>
		);
	}

	renderInstructor = (permissions, isMe) => {
		const {isInstructor} = permissions;

		return (
			<div className="instructor-container">
				<Checkbox checked={isInstructor} onChange={this.toggleInstructor} disabled={isMe} />
			</div>
		);
	}


	renderEditor = (permissions, isMe) => {
		const {isEditor} = permissions;

		return (
			<div className="editor-container">
				<Checkbox checked={isEditor} onChange={this.toggleEditor} disabled={isMe} />
			</div>
		);
	}
}
