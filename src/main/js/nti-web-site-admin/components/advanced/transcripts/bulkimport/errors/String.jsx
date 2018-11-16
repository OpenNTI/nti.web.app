import React from 'react';
import PropTypes from 'prop-types';

import StatusReport from '../StatusReport';

export default class StringError extends React.Component {

	static handles = e => typeof e === 'string'

	static propTypes = {
		error: PropTypes.string
	}

	render () {
		const {error} = this.props;
		return !error ? null : (
			<StatusReport className="transcript-bulk-import-error" heading={error} />
		);
	}
}
