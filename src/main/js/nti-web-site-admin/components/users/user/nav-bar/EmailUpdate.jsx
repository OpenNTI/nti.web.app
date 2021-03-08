import React from 'react';
import PropTypes from 'prop-types';

import { scoped } from '@nti/lib-locale';
import { Button, Form, User } from '@nti/web-commons';

import Card from '../../../common/Card';

const t = scoped('nti-web-site-admin.users.user.nav-bar.EmailUpdate', {
	trigger: 'Update Email',
	label: 'Update the email for: %(name)s',
	newEmail: 'New Email',
	oldEmail: 'Old Email',
});

const Link = 'AdminUserUpdate';

const EmailUpdateCard = styled(Card)`
	margin-top: 0.625rem;
	overflow: hidden;
`;

const EmailUpdateButton = styled(Button)`
	width: 100%;
	text-align: center;
`;

const EmailLabel = styled(User.DisplayName)`
	display: block;
	margin-bottom: 1rem;
	font-style: normal;
`;

const getUsername = data => t('label', data);

UserEmailUpdate.propTypes = {
	user: PropTypes.shape({
		email: PropTypes.string,
		hasLink: PropTypes.func,
		putToLink: PropTypes.func,
	}),
};
export default function UserEmailUpdate({ user }) {
	const [open, setOpen] = React.useState(false);
	const doOpen = React.useCallback(() => setOpen(true), [setOpen]);
	const doClose = React.useCallback(() => setOpen(false), [setOpen]);

	const onSubmit = React.useCallback(
		({ json }) => user.putToLink(Link, { email: json.email }),
		[user]
	);

	if (!user.hasLink(Link)) {
		return null;
	}

	return (
		<EmailUpdateCard>
			<EmailUpdateButton onClick={doOpen}>
				{t('trigger')}
			</EmailUpdateButton>
			{open && (
				<Form.Prompt
					onSubmit={onSubmit}
					afterSubmit={doClose}
					onCancel={doClose}
					actionLabel="Submit"
				>
					<EmailLabel user={user} localeKey={getUsername} />
					<Form.Input.Text
						layout="box"
						name="oldEmail"
						label={t('oldEmail')}
						value={user.email}
						readOnly
					/>
					<Form.Input.Text
						layout="box"
						name="email"
						label={t('newEmail')}
					/>
				</Form.Prompt>
			)}
		</EmailUpdateCard>
	);
}
