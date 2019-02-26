import React from 'react';
import PropTypes from 'prop-types';

export default class Gutter extends React.Component {
	static propTypes = {
		notes: PropTypes.array
	}

	render () {
		return (
			<div>(gutter)</div>
		);
	}
}
