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
		delete: {
			short: 'Delete',
			long: 'Delete Invitations',
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

export function CancelButton({
	invites,
	long,
	deletes,
	before,
	after,
	...otherProps
}) {
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

	const localeKeys = [
		deletes ? 'delete' : 'rescind',
		long ? 'long' : 'short',
	];

	return (
		<AsyncAction onClick={onClick} destructive {...otherProps}>
			{long ? (
				<>
					{deletes ? <Icons.TrashCan /> : <Icons.Reset />}
					<span>{t(localeKeys.join('.'))}</span>
				</>
			) : (
				t('rescind.short')
			)}
		</AsyncAction>
	);
}
