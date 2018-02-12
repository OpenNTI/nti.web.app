import React from 'react';
import PropTypes from 'prop-types';

import DateValue from '../../../common/DateValue';

export default class LastLogin extends React.Component {
	static propTypes = {
		user: PropTypes.object.isRequired,
		historicalSessions: PropTypes.arrayOf(PropTypes.object),
		loading: PropTypes.bool
	}

	render () {
		const {loading, historicalSessions} = this.props;

		const date = historicalSessions && historicalSessions.length > 0 && new Date(historicalSessions[0].SessionStartTime * 1000);

		return (<DateValue loading={loading} date={date} label="Last Login" format="lll" />);
	}
}
