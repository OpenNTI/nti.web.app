import React from 'react';
import PropTypes from 'prop-types';
import {scoped} from '@nti/lib-locale';
import {DialogButtons, TokenEditor, SelectBox, Panels, Input, Loading} from '@nti/web-commons';
import {validate as isEmail} from 'email-validator';
import { Connectors } from '@nti/lib-store';

const DEFAULT_TEXT = {
	people: 'People',
	title: 'Invite People',
	importFile: 'Upload CSV File',
	role: 'Role'
};

const t = scoped('nti-web-site-admin.componentsusers.list.InvitePeople', DEFAULT_TEXT);


export default
@Connectors.Any.connect(['inviteError', 'hideInviteDialog', 'sendLearnerInvites', 'sendAdminInvites'])
class InvitePeople extends React.Component {
	static propTypes = {
		loading: PropTypes.bool,
		hideInviteDialog: PropTypes.func.isRequired,
		sendLearnerInvites: PropTypes.func.isRequired,
		sendAdminInvites: PropTypes.func.isRequired,
		inviteError: PropTypes.string
	}

	state = {
		role: 'learner',
		file: null
	}

	onCancel = () => {
		this.props.hideInviteDialog();
	}

	onSave = async () => {
		const {sendAdminInvites, sendLearnerInvites} = this.props;
		const {role, message, emails, file} = this.state;

		if(role === 'learner') {
			sendLearnerInvites(emails, message, file);
		} else {
			sendAdminInvites(emails, message, file);
		}
	}

	onToChange = (emails) => {
		this.setState({ emails });
	}

	onMessageChange = (message) => {
		this.setState({ message });
	}

	onRoleChange = (role) => {
		this.setState({ role });
	}

	validator = (value) => {
		let errors = [];

		if(!value || !isEmail(value)) {
			errors.push('Invalid email address');
		}

		return errors;
	}

	renderFileUpload () {
		return <Input.File label={t('importFile')} accept=".csv" onFileChange={file => this.setState({ file })} />;
	}

	renderToField () {
		const { emails, file } = this.state;
		const noEmails = !emails || emails.length === 0;
		return (
			<div className="invite-people-to-field">
				<div className="label">To</div>
				{!file && (
					<TokenEditor
						value={emails}
						onChange={this.onToChange}
						placeholder={emails && emails.length > 0 ? 'Add more email addresses' : 'Enter an email address'}
						validator={this.validator}
						maxTokenLength={64}
					/>
				)}
				{file && (
					<div className="file-pill-wrap">
						<div className="file-pill">
							{file.name}
							<i className="icon-bold-x small" onClick={() => this.setState({ file: null })} />
						</div>
					</div>
				)}
				{!file && noEmails && this.renderFileUpload()}
			</div>
		);
	}

	renderRoleField () {
		const { role } = this.state;

		const OPTIONS = [
			{ label: 'Learner', value: 'learner' },
			{ label: 'Administrator', value: 'admin' }
		];

		return (
			<div className="invite-people-role-field">
				<div className="label">{t('role')}</div>
				<SelectBox options={OPTIONS} onChange={this.onRoleChange} value={role}/>
			</div>
		);
	}

	renderMessageField () {
		return (
			<div className="invite-people-message-field">
				<Input.TextArea value={this.state.message} onChange={this.onMessageChange} placeholder="Write a personal message..."/>
			</div>
		);
	}

	renderContents () {
		const { loading } = this.props;

		if (loading) { return <Loading.Mask />; }

		return (
			<>
				{this.renderToField()}
				{this.renderRoleField()}
				{this.renderMessageField()}
			</>
		);
	}

	render () {
		const { emails, file } = this.state;
		const { loading, inviteError } = this.props;

		const buttons = [
			{
				label: 'Cancel',
				className: 'cancel',
				onClick: loading ? () => {} : this.onCancel
			},
			{
				label: 'Send',
				className: 'save',
				disabled: loading || (!file && (!emails || emails.length === 0)),
				onClick: loading ? () => {} : this.onSave
			}
		];

		return (
			<div className="site-admin-invite-people-dialog">
				<div className="title">
					<Panels.TitleBar title={t('title')} iconAction={loading ? () => {} : this.onCancel} />
				</div>
				{inviteError && <Panels.MessageBar message={inviteError} error />}
				<div className="contents">
					{this.renderContents()}
				</div>
				<DialogButtons buttons={buttons}/>
			</div>
		);
	}
}
