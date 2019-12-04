import React from 'react';
import PropTypes from 'prop-types';
import {DisplayName} from '@nti/web-commons';

export default class DisplayNameColumn extends React.Component {

	static propTypes = {
		item: PropTypes.oneOfType([
			PropTypes.object,
			PropTypes.string
		])
	}

	static HeaderComponent = () => 'Name'

	render () {
		const {item: entity} = this.props;

		return (
			<DisplayName entity={entity} />
		);
	}
}
