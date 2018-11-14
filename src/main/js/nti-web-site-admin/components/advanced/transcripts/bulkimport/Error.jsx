import React from 'react';
import PropTypes from 'prop-types';

import getError from './errors';

export default class Error extends React.Component {

	static propTypes = {
		error: PropTypes.oneOfType([
			PropTypes.object,
			PropTypes.string
		])
	}

	render () {
		const {error} = this.props;
		const e = getError(error);

		return !e ? null : (
			<div className="transcript-credit-error">
				<div className="message">{e}</div>
			</div>
		);
	}
}
