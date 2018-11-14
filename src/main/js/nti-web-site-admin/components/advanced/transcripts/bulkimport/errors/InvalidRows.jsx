import React from 'react';
import PropTypes from 'prop-types';
import {scoped} from '@nti/lib-locale';

const t = scoped('web-site-admin.components.advanced.transcripts.bulkimport.error.InvalidRowsError', {
	message: {
		one: 'Your file contained an invalid row. Import aborted.',
		other: 'Your file contained %(count)s invalid rows. Import aborted.'
	}
});

export default class InvalidRowsError extends React.Component {

	static handles = error => error && error.code && error.code === 'InvalidRowsError'

	static propTypes = {
		error: PropTypes.object.isRequired
	}

	render () {
		const {error: {InvalidRows: rows = []} = {}} = this.props;
		const message = t('message', {count: rows.length});

		return (
			<div className="transcript-bulk-import-error">
				{message}
			</div>
		);
	}
}
