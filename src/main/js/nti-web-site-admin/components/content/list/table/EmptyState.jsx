import './EmptyState.scss';
import React from 'react';
import PropTypes from 'prop-types';

import { scoped } from '@nti/lib-locale';

const DEFAULT_TEXT = {
	emptyMessage: 'There is no content',
};

const t = scoped('nti-site-admin.content.list.table.EmptyState', DEFAULT_TEXT);

EmptyState.propTypes = {
	message: PropTypes.string,
};

export default function EmptyState({ message }) {
	return <div className="empty-state">{message || t('emptyMessage')}</div>;
}
