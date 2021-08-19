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
		deletePrompt: {
			title: 'Delete Invitations',
			message:
				'This will remove the invitations, they will not be able to be redeemed or resent.',
		},
	}
);

const prompt = async (invites, deletes) => {
	const getLocale = (k, d) =>
		t(`${deletes ? 'deletePrompt' : 'prompt'}.${k}`, d);

	try {
		await Prompt.areYouSure(
			getLocale('message', { invites, count: invites.length }),
			getLocale('title'),
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

function CancelButtonImpl(
	{ invites, long, deletes, before, after, ...otherProps },
	ref
) {
	const onClick = useCallback(
		async (_, { reset }) => {
			try {
				before?.();
				const confirm = await prompt(invites, deletes);

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
		<AsyncAction ref={ref} onClick={onClick} destructive {...otherProps}>
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

export const CancelButton = React.forwardRef(CancelButtonImpl);
