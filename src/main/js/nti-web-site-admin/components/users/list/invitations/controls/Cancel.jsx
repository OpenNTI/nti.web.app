import React, { useCallback } from 'react';

import { AsyncAction, Icons } from '@nti/web-core';
import { Prompt } from '@nti/web-commons';
import { scoped } from '@nti/lib-locale';

import { rescind } from '../Store';

const t = scoped(
	'nti-web-site-admin.components.users.list.invitations.controls.Rescind',
	{
		rescind: {
			short: 'Cancel',
			long: 'Cancel Invitations',
		},
		prompt: {
			title: 'Cancel Invitations',
			message: {
				one: 'Cancel the invitation for %(invites[0].receiver)s?',
				other: 'Cancel the selected invitations?',
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

export function CancelButton({ invites, long, before, after, ...otherProps }) {
	const onClick = useCallback(
		async (_, { reset }) => {
			try {
				before?.();
				const confirm = await prompt(invites);

				if (!confirm) {
					throw 'canceled'; //eslint-disable-line
				}

				await rescind(invites);
			} finally {
				after?.();
			}
		},
		[invites, after]
	);

	return (
		<AsyncAction onClick={onClick} destructive {...otherProps}>
			{long ? (
				<>
					<Icons.Reset />
					<span>{t('rescind.long')}</span>
				</>
			) : (
				t('rescind.short')
			)}
		</AsyncAction>
	);
}
