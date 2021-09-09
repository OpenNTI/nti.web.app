import React, { useCallback } from 'react';

import { AsyncAction } from '@nti/web-core';
import { Prompt } from '@nti/web-commons';
import { scoped } from '@nti/lib-locale';

import { resend } from '../Store';

const t = scoped(
	'nti-web-site-admin.components.users.list.invitations.controls.Resend',
	{
		resend: 'Re-send',
		invite: 'Invite',
		prompt: {
			title: 'Re-send Invitations?',
			message: {
				one: 'Re-send the invitation for %(invites[0].receiver)s?',
				other: 'Re-send the selected invitations?',
			},
		},
	}
);

const prompt = async invites => {
	try {
		await Prompt.areYouSure(
			t('prompt.message', { invites, count: invites.length }),
			t('prompt.title'),
			{
				iconClass: 'alert',
				confirmButtonClass: 'alert',
				confirmButtonLabel: 'Yes',
				cancelButtonLabel: 'No',
			}
		);
		return true;
	} catch (e) {
		return false;
	}
};

function ResendButtonImpl({ invites, before, after, ...otherProps }, ref) {
	const onClick = useCallback(
		async (_, { reset }) => {
			try {
				before?.();
				const confirm = await prompt(invites);
				if (!confirm) {
					throw 'canceled'; //eslint-disable-line
				}

				await resend(invites);
			} finally {
				after?.();
			}
		},
		[...invites, after]
	);

	const isCanceled = invites.length === 0 && invites[0].expired;
	// Since AsyncAction is stateful, we need to force it to unmount/remount if the key changes
	const stateKey = invites.map(x => x?.getID?.()).join('|');

	return (
		<AsyncAction onClick={onClick} primary {...otherProps} key={stateKey}>
			{isCanceled ? t('invite') : t('resend')}
		</AsyncAction>
	);
}

export const ResendButton = React.forwardRef(ResendButtonImpl);
