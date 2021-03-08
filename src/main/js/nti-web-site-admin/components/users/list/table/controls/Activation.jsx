import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';

import { scoped } from '@nti/lib-locale';
import { Connectors } from '@nti/lib-store';
import { Button, User, Text, StandardUI } from '@nti/web-commons';

const { Prompt } = StandardUI;

const Styles = stylesheet`
	.label {
		margin: 0.875rem 0
	}

	.users {
		margin-bottom: 1.5rem;
	}
`;

const t = scoped(
	'nti-web-site-admin.components.users.list.table.controls.Activation',
	{
		deactivate: 'Deactivate',
		reactivate: 'Reactivate',
		confirmDeactivate: {
			title: {
				one: 'Confirm Deactivation (%(count)s Person)',
				other: 'Confirm Deactivation (%(count)s People)',
			},
			description: {
				one:
					'Are you sure you want to deactivate? The account will lose access to all courses. The account can be reactivated at any time.',
				other:
					'Are you sure you want to deactivate? Accounts will lose access to all courses. Accounts can be reactivated at any time.',
			},
			label: 'People',
		},
		confirmReactivate: {
			title: {
				one: 'Confirm Reactivation (%(count)s Person)',
				other: 'Confirm Reactivation (%(count)s People)',
			},
			description: {
				one:
					'Are you sure you want to reactivate? This account and their records will be accessible again.',
				other:
					'Are you sure you want to reactivate? These accounts and their records will be accessible again.',
			},
			label: 'People',
		},
	}
);

UserActivationConfirmation.propTypes = {
	users: PropTypes.array,
	deactivating: PropTypes.bool,
	activating: PropTypes.bool,
	onConfirm: PropTypes.func,
	onCancel: PropTypes.func,
};
function UserActivationConfirmation({
	users,
	deactivating,
	activating,
	onConfirm,
	onCancel,
}) {
	const count = users.length;

	const locale = activating ? 'confirmReactivate' : 'confirmDeactivate';
	const getString = (key, data) => t(`${locale}.${key}`, data);

	const title = getString('title', { count });
	const body = (
		<div className="activation-confirmation-body">
			<Text.Base>{getString('description', { count })}</Text.Base>
			<Text.Label
				className={Styles.label}
				as="div"
				color={Text.Colors.tertiaryGrey}
			>
				{getString('label')}
			</Text.Label>
			<User.AvatarGrid className={Styles.users} users={users} />
		</div>
	);

	return (
		<Prompt.Confirm
			title={title}
			body={body}
			destructive={deactivating}
			onConfirm={onConfirm}
			onCancel={onCancel}
		/>
	);
}

UserActivationButton.propTypes = {
	selectedUsers: PropTypes.array,
	canDeactivateUsers: PropTypes.bool,
	canActivateUsers: PropTypes.bool,
	deactivateUsers: PropTypes.func,
	activateUsers: PropTypes.func,
};
function UserActivationButton({
	selectedUsers,
	canDeactivateUsers,
	canActivateUsers,
	deactivateUsers,
	activateUsers,
}) {
	const [confirming, setConfirming] = React.useState(false);

	const { activated, deactivated } = (selectedUsers ?? []).reduce(
		(acc, user) => {
			if (user.Deactivated) {
				acc.deactivated.push(user);
			} else {
				acc.activated.push(user);
			}

			return acc;
		},
		{ activated: [], deactivated: [] }
	);

	const mixed = activated.length && deactivated.length;
	const available =
		(activated.length && canDeactivateUsers) ||
		(deactivated.length && canActivateUsers);

	const deactivating = activated.length > 0;
	const activating = deactivated.length > 0;

	const onConfirm = () => {
		if (deactivating && canDeactivateUsers) {
			deactivateUsers(selectedUsers);
		} else if (activating && canActivateUsers) {
			activateUsers(selectedUsers);
		}
	};

	//if the selected users are mixed or the action isn't available don't render anything
	if (mixed || !available) {
		return null;
	}

	return (
		<>
			<Button
				className={cx('button', 'activate-button', {
					activating,
					deactivating,
				})}
				plain
				onClick={() => setConfirming(true)}
			>
				{deactivating ? t('deactivate') : t('reactivate')}
			</Button>
			{confirming && (
				<UserActivationConfirmation
					users={selectedUsers}
					deactivating={deactivating}
					activating={activating}
					onConfirm={onConfirm}
					onCancel={() => setConfirming(false)}
				/>
			)}
		</>
	);
}

export default Connectors.Any.connect([
	'selectedUsers',
	'canDeactivateUsers',
	'canActivateUsers',
	'deactivateUsers',
	'activateUsers',
])(UserActivationButton);
