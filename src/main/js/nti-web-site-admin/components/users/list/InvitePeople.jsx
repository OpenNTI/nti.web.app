import React from 'react';
import PropTypes from 'prop-types';
import {scoped} from '@nti/lib-locale';
import {Prompt, DialogButtons, Avatar, Panels} from '@nti/web-commons';

const DEFAULT_TEXT = {
	description: 'Changing a person\'s role wil effect what features and permissions are available.',
	subDescription: 'You can change a person\'s role at any time.',
	people: 'People',
	title: 'Invite People'
};

const t = scoped('nti-web-site-admin.componentsusers.list.InvitePeople', DEFAULT_TEXT);


export default class InvitePeople extends React.Component {
	static show () {
		return new Promise((fulfill, reject) => {
			Prompt.modal(
				<InvitePeople
					onFinish={fulfill}
					onCancel={reject}
				/>,
				'site-admin-invite-people-container'
			);
		});
	}

	static propTypes = {
		selectedUsers: PropTypes.array,
		removing: PropTypes.bool,
		onDismiss: PropTypes.func,
		onFinish: PropTypes.func,

	}

	constructor (props) {
		super(props);
	}


	state = {}

	onSave = () => {
		const {onFinish, onDismiss} = this.props;

		// if(removing) {
		// 	this.adminStore.removeAdmin(selectedUsers);
		// }
		// else {
		// 	this.adminStore.addAdmin(selectedUsers);
		// }

		onFinish();
		onDismiss();
	}

	renderUser = (user) => {
		return <div className="user"><Avatar entity={user}/></div>;
	}

	render () {
		const buttons = [
			{
				label: 'Cancel',
				className: 'cancel',
				onClick: this.props.onDismiss
			},
			{
				label: 'Save',
				className: 'save',
				onClick: this.onSave
			}
		];


		return (
			<div className="site-admin-invite-people-dialog">
				<div className="title">
					<Panels.TitleBar title={t('title')} iconAction={this.props.onDismiss} />
				</div>
				<div className="contents">

				</div>
				<DialogButtons buttons={buttons}/>
			</div>
		);
	}
}
