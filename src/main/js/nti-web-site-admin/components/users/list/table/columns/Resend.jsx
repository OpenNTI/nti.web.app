import PropTypes from 'prop-types';

import ResendButton from '../ResendButton';

export default function Resend({ item, store }) {
	return store.getSelectedCount() ? null : (
		<ResendButton items={[item]} store={store} />
	);
}

Resend.propTypes = {
	item: PropTypes.shape({
		receiver: PropTypes.string.isRequired,
	}).isRequired,
	store: PropTypes.shape({
		getSelectedCount: PropTypes.func.isRequired,
	}).isRequired,
};
