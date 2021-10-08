import { useState, useCallback } from 'react';

import { Prompt } from '@nti/web-commons';
import { Button, Icons } from '@nti/web-core';

import t from './strings';
import { InvitePeopleForm } from './InvitePeopleForm';

export function InvitePeopleButton(props) {
	const [open, setOpen] = useState(false);

	const doOpen = useCallback(() => setOpen(true), [setOpen]);
	const doClose = useCallback(() => setOpen(false), [setOpen]);

	return (
		<>
			<Button {...props} onClick={doOpen}>
				<Icons.AddFriend />
				<span>{t('button')}</span>
			</Button>
			{open && (
				<Prompt.Dialog onBeforeDismiss={doClose}>
					<InvitePeopleForm onDone={doClose} />
				</Prompt.Dialog>
			)}
		</>
	);
}
