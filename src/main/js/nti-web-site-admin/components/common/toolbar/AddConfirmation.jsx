import React from 'react';
import PropTypes from 'prop-types';
import {Avatar, DisplayName} from 'nti-web-commons';
import {scoped} from 'nti-lib-locale';

const DEFAULT_TEXT = {
	confirm: 'Confirm',
	cancel: 'Cancel',
	confirmationMessageSingle: 'Are you sure you want to give this user site admin permissions?',
	confirmationMessagePlural: 'Are you sure you want to give these users site admin permissions?'
};
const t = scoped('nti-site-admin.common.components.toolbar.addconfirmation', DEFAULT_TEXT);

export default class AddConfirmation extends React.Component {
	static propTypes = {
		selectedUsers: PropTypes.arrayOf(PropTypes.object).isRequired,
		onConfirm: PropTypes.func,
		onCancel: PropTypes.func
	}

	renderItem = (user) => {
		return (
			<div key={user.Username} className="admin">
				<Avatar className="admin-avatar" entity={user}/>
				<DisplayName className="admin-name" entity={user}/>
			</div>
		);
	}

	renderMessage () {
		const msg = this.props.selectedUsers.length === 1 ? t('confirmationMessageSingle') : t('confirmationMessagePlural');

		return <div className="confirmation-message">{msg}</div>;
	}

	renderControls () {
		const {onConfirm, onCancel} = this.props;

		return (
			<div className="confirmation-controls">
				<div className="cancel" onClick={onCancel}>{t('cancel')}</div>
				<div className="confirm" onClick={onConfirm}>{t('confirm')}</div>
			</div>
		);
	}

	render () {
		const {selectedUsers} = this.props;

		return (
			<div className="add-confirmation">
				{this.renderMessage()}
				<div className="admins-to-confirm">
					{selectedUsers.map(this.renderItem)}
				</div>
				{this.renderControls()}
			</div>
		);
	}
}
