import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { Button, Prompt } from '@nti/web-commons';
import { scoped } from '@nti/lib-locale';

import Styles from './ResendButton.css';

const t = scoped('nti-web-site-admin.components.users.list.table.Resend', {
	resend: 'Re-send',
	prompt: {
		one: 'Re-send the invitation for %(items[0].receiver)s?',
		other: 'Re-send the selected invitations?',
	},
});

export default function ResendButton({ items, store }) {
	const onClick = useCallback(() => {
		Prompt.areYouSure(
			t('prompt', { items, count: items.length }),
			'Re-send Invitations?',
			{
				iconClass: 'alert',
				confirmButtonClass: 'alert',
				confirmButtonLabel: 'Yes',
				cancelButtonLabel: 'No',
			}
		).then(() => store.resend(items));
	}, [items, store]);

	return (
		<Button
			className={cx('button', 'resend', Styles.resendButton)}
			plain
			onClick={onClick}
		>
			{t('resend')}
		</Button>
	);
}

ResendButton.propTypes = {
	items: PropTypes.arrayOf(
		PropTypes.shape({
			receiver: PropTypes.string.isRequired,
		}).isRequired
	).isRequired,
	store: PropTypes.shape({
		resend: PropTypes.func.isRequired,
		getSelectedCount: PropTypes.func.isRequired,
	}).isRequired,
};
