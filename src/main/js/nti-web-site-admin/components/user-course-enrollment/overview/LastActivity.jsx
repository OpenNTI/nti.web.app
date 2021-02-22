import React from 'react';
import PropTypes from 'prop-types';
import { DateTime } from '@nti/web-commons';

import DateValue from '../../common/DateValue';

export default class LastActivity extends React.Component {
	static propTypes = {
		enrollment: PropTypes.object.isRequired,
	};

	constructor(props) {
		super(props);

		this.state = {};
	}

	render() {
		const { enrollment } = this.props;

		return (
			<DateValue
				date={enrollment.getLastSeenTime()}
				format={DateTime.MONTH_ABBR_DAY_YEAR_TIME}
				label="Last Active"
			/>
		);
	}
}
