import React from 'react';
import PropTypes from 'prop-types';
import {scoped} from '@nti/lib-locale';
import {DialogButtons, TokenEditor, SelectBox, Panels, Input, Loading} from '@nti/web-commons';
import {validate as isEmail} from 'email-validator';

const DEFAULT_TEXT = {
	people: 'People',
	title: 'Invite People'
};

const t = scoped('nti-web-site-admin.componentsusers.list.InvitePeople', DEFAULT_TEXT);


export default class InvitePeople extends React.Component {
	static propTypes = {
		store: PropTypes.object.isRequired,
		loading: PropTypes.bool

	}

	constructor (props) {
		super(props);
	}


	state = {
		role: 'learner'
	}

	onCancel = () => {
		this.props.store.hideInviteDialog();
	}

	onSave = async () => {
		const {store} = this.props;
		const {role, message, emails} = this.state;

		if(role === 'learner') {
			store.sendLearnerInvites(emails, message);
		} else {
			store.sendAdminInvites(emails, message);
		}
	}

	onToChange = (emails) => {
		this.setState({emails});
	}

	validator = (value) => {
		let errors = [];

		if(!value || !isEmail(value)) {
			errors.push('Invalid email address');
		}

		return errors;
	}

	renderToField () {
		const { emails } = this.state;

		return (
			<div className="invite-people-to-field">
				<div className="label">To</div>
				<TokenEditor
					value={emails}
					onChange={this.onToChange}
					placeholder={emails && emails.length > 0 ? 'Add more email addresses' : 'Enter an email address'}
					validator={this.validator}
					maxTokenLength={64}/>
			</div>
		);
	}

	onRoleChange = (role) => {
		this.setState({role});
	}

	renderRoleField () {
		const {role} = this.state;

		const OPTIONS = [
			{ label: 'Learner', value: 'learner'},
			{ label: 'Administrator', value: 'admin'}
		];

		return (
			<div className="invite-people-role-field">
				<div className="label">Role</div>
				<SelectBox options={OPTIONS} onChange={this.onRoleChange} value={role}/>
			</div>
		);
	}

	onMessageChange = (message) => {
		this.setState({message});
	}

	renderMessageField () {
		return (
			<div className="invite-people-message-field">
				<Input.TextArea value={this.state.message} onChange={this.onMessageChange} placeholder="Write a personal message..."/>
			</div>
		);
	}


	render () {
		const { emails } = this.state;
		const { loading } = this.props;

		const buttons = [
			{
				label: 'Cancel',
				className: 'cancel',
				onClick: !loading && this.onCancel
			},
			{
				label: 'Send',
				className: 'save',
				disabled: loading || (!emails || emails.length === 0),
				onClick: !loading && this.onSave
			}
		];


		return (
			<div className="site-admin-invite-people-dialog">
				<div className="title">
					<Panels.TitleBar title={t('title')} iconAction={!loading && this.onCancel} />
				</div>
				<div className="contents">
					{loading && <Loading.Mask/>}
					{!loading && this.renderToField()}
					{!loading && this.renderRoleField()}
					{!loading && this.renderMessageField()}
				</div>
				<DialogButtons buttons={buttons}/>
			</div>
		);
	}
}
