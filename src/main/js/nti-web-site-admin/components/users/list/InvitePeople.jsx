import './InvitePeople.scss';
import React from 'react';
import { validate as isEmail } from 'email-validator';

import { scoped } from '@nti/lib-locale';
import {
	DialogButtons,
	TokenEditor,
	Select,
	Panels,
	Input,
	Loading,
	List,
} from '@nti/web-commons';
import { Connectors } from '@nti/lib-store';

const DEFAULT_TEXT = {
	people: 'People',
	title: 'Invite People',
	importFile: 'Upload CSV File',
	role: 'Role',
	invalidEmails: {
		message: {
			one: 'There is an invalid email: ',
			other: 'There are invalid emails: ',
		},
	},
};

const t = scoped(
	'nti-web-site-admin.components.users.list.InvitePeople',
	DEFAULT_TEXT
);

const errorRenderers = [
	{
		handles: error =>
			error.code === 'InvalidSiteInvitationData' &&
			error.InvalidEmails &&
			error.InvalidEmails.length > 0,
		render: error => {
			const { InvalidEmails } = error;

			return (
				<>
					<span>
						{t('invalidEmails.message', {
							count: InvalidEmails.length,
						})}
					</span>
					<List.LimitedInline limit={2}>
						{InvalidEmails.map((email, key) => {
							return <span key={key}>{email}</span>;
						})}
					</List.LimitedInline>
				</>
			);
		},
	},
	{
		handles: () => true,
		render: error => error.Message || error.message,
	},
];

class InvitePeople extends React.Component {
	state = {
		role: 'learner',
		file: null,
	};

	onCancel = () => {
		this.props.hideInviteDialog();
	};

	onSave = async () => {
		const { sendAdminInvites, sendLearnerInvites } = this.props;
		const { role, message, emails, file } = this.state;

		if (role === 'learner') {
			sendLearnerInvites(emails, message, file);
		} else {
			sendAdminInvites(emails, message, file);
		}
	};

	onToChange = emails => {
		this.setState({ emails });
	};

	onMessageChange = message => {
		this.setState({ message });
	};

	validator = value => {
		let errors = [];

		if (!value || !isEmail(value)) {
			errors.push('Invalid email address');
		}

		return errors;
	};

	renderFileUpload() {
		return (
			<Input.File
				label={t('importFile')}
				accept=".csv"
				onFileChange={file => this.setState({ file })}
			/>
		);
	}

	renderError() {
		const { inviteError } = this.props;
		const renderer = errorRenderers.find(option =>
			option.handles(inviteError)
		);

		if (!renderer) {
			throw new Error('Unknown error type');
		}

		return (
			<div className="invite-error">{renderer.render(inviteError)}</div>
		);
	}

	renderToField() {
		const { clearInviteError } = this.props;
		const { emails, file } = this.state;
		const noEmails = !emails || emails.length === 0;
		return (
			<div className="invite-people-to-field">
				<div className="label">To</div>
				{!file && (
					<TokenEditor
						value={emails}
						onChange={this.onToChange}
						placeholder={
							emails && emails.length > 0
								? 'Add more email addresses'
								: 'Enter an email address'
						}
						validator={this.validator}
						maxTokenLength={64}
					/>
				)}
				{file && (
					<div className="file-pill-wrap">
						<div className="file-pill">
							{file.name}
							<i
								className="icon-bold-x small"
								onClick={() =>
									this.setState({ file: null }, () => {
										clearInviteError();
									})
								}
							/>
						</div>
					</div>
				)}
				{!file && noEmails && this.renderFileUpload()}
			</div>
		);
	}

	maybeSubmit = e => {
		if (
			!this.canSend() ||
			e.key !== 'Enter' ||
			(!e.ctrlKey && !e.metaKey)
		) {
			return;
		}

		this.onSave();
	};

	canSend() {
		const {
			props: { loading },
			state: { file, emails },
		} = this;
		return (!loading && file) || emails?.length > 0;
	}

	render() {
		const { role } = this.state;
		const { loading, inviteError } = this.props;

		const buttons = [
			{
				label: 'Cancel',
				className: 'cancel',
				onClick: loading ? () => {} : this.onCancel,
			},
			{
				label: 'Send',
				className: 'save',
				disabled: !this.canSend(),
				onClick: loading ? () => {} : this.onSave,
			},
		];

		return (
			<div className="site-admin-invite-people-dialog">
				<div className="title">
					<Panels.TitleBar
						title={t('title')}
						iconAction={loading ? () => {} : this.onCancel}
					/>
				</div>
				{inviteError && this.renderError()}
				<div className="contents">
					{loading ? (
						<Loading.Mask />
					) : (
						<>
							{this.renderToField()}
							<div className="invite-people-role-field">
								<div className="label">{t('role')}</div>
								<Select
									onChange={e =>
										this.setState({ role: e.target.value })
									}
									value={role}
									className="invite-select"
								>
									<option value="learner">Learner</option>
									<option value="admin">Administrator</option>
								</Select>
							</div>
							<div className="invite-people-message-field">
								<Input.TextArea
									value={this.state.message}
									onChange={this.onMessageChange}
									placeholder="Write a personal message..."
									onKeyDown={this.maybeSubmit}
								/>
							</div>
						</>
					)}
				</div>
				<DialogButtons buttons={buttons} />
			</div>
		);
	}
}

export default Connectors.Any.connect([
	'inviteError',
	'hideInviteDialog',
	'sendLearnerInvites',
	'sendAdminInvites',
	'clearInviteError',
])(InvitePeople);
