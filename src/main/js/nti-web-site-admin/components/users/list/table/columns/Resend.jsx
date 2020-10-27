import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import {Prompt} from '@nti/web-commons';

export default function Resend ({item, store}) {
	const onClick = useCallback(() => {
		Prompt.areYouSure(
			`Do you want to re-send the pending invitation for ${item.receiver}?`,
			'Re-send Invitation?',
			{
				iconClass: 'alert',
				confirmButtonClass: 'alert',
				confirmButtonLabel: 'Yes',
				cancelButtonLabel: 'No'
			}
		).then(() => store.resend(item));
	}, [item, store]);

	return (
		<div onClick={onClick}>Resend</div>
	);
}

Resend.propTypes = {
	item: PropTypes.shape({
		receiver: PropTypes.string.isRequired,
	}).isRequired,
	store: PropTypes.shape({
		resend: PropTypes.func.isRequired,
	}).isRequired,
};
