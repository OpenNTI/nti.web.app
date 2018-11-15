import React from 'react';
import PropTypes from 'prop-types';
import Logger from '@nti/util-logger';
import {scoped} from '@nti/lib-locale';

import StatusReport from '../StatusReport';

const logger = Logger.get('web-site-admin.components.advanced.transcripts.bulkimport.error');

const t = scoped('web-site-admin.components.advanced.transcripts.bulkimport.error.Unknown', {
	message: 'Unable to process your upload.'
});

export default class UnknownError extends React.Component {

	static handles = error => true

	static propTypes = {
		error: PropTypes.object.isRequired
	}

	constructor (props) {
		super(props);
		logger.warn('Unrecognized transcript import error: %o', (props || {}).error);
	}

	render () {
		const {error: {message: m} = {}} = this.props;
		const message = m || t('message');

		return (
			<StatusReport className="transcript-bulk-import-error" heading={message} />
		);
	}
}
